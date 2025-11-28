from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.db.models import Count, Q
from .models import Request, Attachment
from .forms import RequestCreateForm
from .utils import generate_qr_code


@login_required
def student_dashboard(request):
    """Dashboard étudiant"""
    # Vérifier que l'utilisateur est étudiant
    if not hasattr(request.user, 'student_profile'):
        messages.error(request, 'Accès réservé aux étudiants.')
        return redirect('home')

    student = request.user.student_profile

    # Statistiques
    total_requests = Request.objects.filter(student=student).count()
    pending_requests = Request.objects.filter(
        student=student,
        status__in=['sent', 'received', 'approved', 'in_cellule', 'returned']
    ).count()
    completed_requests = Request.objects.filter(student=student, status='done').count()

    # Requêtes récentes
    recent_requests = Request.objects.filter(student=student).order_by('-submitted_at')[:5]

    # Statistiques par statut
    status_stats = Request.objects.filter(student=student).values('status').annotate(
        count=Count('id')
    )

    context = {
        'student': student,
        'total_requests': total_requests,
        'pending_requests': pending_requests,
        'completed_requests': completed_requests,
        'recent_requests': recent_requests,
        'status_stats': status_stats,
    }

    return render(request, 'student/dashboard.html', context)


@login_required
def student_requests_list(request):
    """Liste des requêtes de l'étudiant"""
    if not hasattr(request.user, 'student_profile'):
        messages.error(request, 'Accès réservé aux étudiants.')
        return redirect('home')

    student = request.user.student_profile

    # Filtres
    status_filter = request.GET.get('status', '')
    type_filter = request.GET.get('type', '')

    requests_list = Request.objects.filter(student=student).order_by('-submitted_at')

    if status_filter:
        requests_list = requests_list.filter(status=status_filter)
    if type_filter:
        requests_list = requests_list.filter(type=type_filter)

    context = {
        'requests_list': requests_list,
        'status_filter': status_filter,
        'type_filter': type_filter,
    }

    return render(request, 'student/requests_list.html', context)


@login_required
def student_create_request(request):
    """Créer une nouvelle requête"""
    if not hasattr(request.user, 'student_profile'):
        messages.error(request, 'Accès réservé aux étudiants.')
        return redirect('home')

    if request.method == 'POST':
        form = RequestCreateForm(request.POST, user=request.user)
        if form.is_valid():
            # Le serializer gère la création via l'API
            # Ici on utilise directement le modèle
            request_obj = form.save(commit=False)

            student = request.user.student_profile
            request_obj.student = student
            request_obj.matricule = student.matricule
            request_obj.student_name = request.user.get_full_name()

            # Auto-assignation
            if request_obj.type == 'cc':
                # Assigner au premier enseignant de la matière
                lecturers = request_obj.subject.lecturers.all()
                if lecturers.exists():
                    request_obj.assigned_to = lecturers.first().user
            else:  # exam
                # Assigner au HOD de la filière
                from .models import Lecturer
                hods = Lecturer.objects.filter(is_hod=True, field=request_obj.field)
                if hods.exists():
                    request_obj.assigned_to = hods.first().user

            request_obj.save()

            # Créer log d'audit
            from .models import AuditLog, Notification
            AuditLog.objects.create(
                request=request_obj,
                action='create',
                to_status=request_obj.status,
                actor=request.user,
                note="Requête créée"
            )

            # Notification à l'assigné
            if request_obj.assigned_to:
                Notification.objects.create(
                    user=request_obj.assigned_to,
                    title="Nouvelle requête assignée",
                    body=f"Nouvelle requête de {request_obj.student_name} pour {request_obj.subject.name}",
                    link=f"/requests/{request_obj.id}/"
                )

            messages.success(request, 'Votre requête a été soumise avec succès!')
            return redirect('student_request_detail', uuid=request_obj.id)
        else:
            messages.error(request, 'Veuillez corriger les erreurs ci-dessous.')
    else:
        form = RequestCreateForm(user=request.user)

    context = {
        'form': form,
    }

    return render(request, 'student/create_request.html', context)


@login_required
def student_request_detail(request, uuid):
    """Détail d'une requête"""
    if not hasattr(request.user, 'student_profile'):
        messages.error(request, 'Accès réservé aux étudiants.')
        return redirect('home')

    request_obj = get_object_or_404(Request, id=uuid, student=request.user.student_profile)

    # Générer QR code
    qr_code = generate_qr_code(request_obj, request)

    context = {
        'request_obj': request_obj,
        'qr_code': qr_code,
    }

    return render(request, 'student/request_detail.html', context)
