from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.db.models import Count, Q
from .models import Request, Lecturer, AuditLog, Notification, RequestResult
from .forms import DecisionForm, CompleteForm


@login_required
def staff_dashboard(request):
    """Dashboard pour le personnel (enseignants et HOD)"""
    # Vérifier que l'utilisateur est un enseignant
    if not hasattr(request.user, 'lecturer_profile'):
        messages.error(request, 'Accès réservé au personnel enseignant.')
        return redirect('home')

    lecturer = request.user.lecturer_profile

    # Statistiques
    my_requests = Request.objects.filter(assigned_to=request.user)
    total_requests = my_requests.count()
    pending_requests = my_requests.filter(
        status__in=['sent', 'received', 'approved', 'in_cellule', 'returned']
    ).count()
    completed_requests = my_requests.filter(status='done').count()

    # Requêtes récentes
    recent_requests = my_requests.order_by('-submitted_at')[:5]

    # Statistiques par statut
    status_stats = my_requests.values('status').annotate(count=Count('id'))

    context = {
        'lecturer': lecturer,
        'total_requests': total_requests,
        'pending_requests': pending_requests,
        'completed_requests': completed_requests,
        'recent_requests': recent_requests,
        'status_stats': status_stats,
    }

    return render(request, 'staff/dashboard.html', context)


@login_required
def staff_requests_list(request):
    """Liste des requêtes assignées au personnel"""
    if not hasattr(request.user, 'lecturer_profile'):
        messages.error(request, 'Accès réservé au personnel enseignant.')
        return redirect('home')

    lecturer = request.user.lecturer_profile

    # Filtres
    status_filter = request.GET.get('status', '')
    type_filter = request.GET.get('type', '')
    subject_filter = request.GET.get('subject', '')
    class_filter = request.GET.get('class', '')

    # Base queryset - requêtes assignées à l'utilisateur
    requests_list = Request.objects.filter(assigned_to=request.user).order_by('-submitted_at')

    # Appliquer les filtres
    if status_filter:
        requests_list = requests_list.filter(status=status_filter)
    if type_filter:
        requests_list = requests_list.filter(type=type_filter)
    if subject_filter:
        requests_list = requests_list.filter(subject_id=subject_filter)
    if class_filter:
        requests_list = requests_list.filter(class_level_id=class_filter)

    # Pour les filtres (dropdowns)
    subjects = lecturer.subjects.all()
    from .models import ClassLevel
    class_levels = ClassLevel.objects.all()

    context = {
        'requests_list': requests_list,
        'status_filter': status_filter,
        'type_filter': type_filter,
        'subject_filter': subject_filter,
        'class_filter': class_filter,
        'subjects': subjects,
        'class_levels': class_levels,
    }

    return render(request, 'staff/requests_list.html', context)


@login_required
def staff_request_detail(request, uuid):
    """Détail d'une requête pour le personnel"""
    if not hasattr(request.user, 'lecturer_profile'):
        messages.error(request, 'Accès réservé au personnel enseignant.')
        return redirect('home')

    # Vérifier que la requête est assignée à l'utilisateur
    request_obj = get_object_or_404(Request, id=uuid, assigned_to=request.user)

    from .utils import generate_qr_code
    qr_code = generate_qr_code(request_obj, request)

    context = {
        'request_obj': request_obj,
        'qr_code': qr_code,
    }

    return render(request, 'staff/request_detail.html', context)


@login_required
def staff_acknowledge_request(request, uuid):
    """Accuser réception d'une requête (sent → received)"""
    if not hasattr(request.user, 'lecturer_profile'):
        messages.error(request, 'Accès réservé au personnel enseignant.')
        return redirect('home')

    request_obj = get_object_or_404(Request, id=uuid, assigned_to=request.user)

    if request_obj.status != 'sent':
        messages.warning(request, 'Cette requête a déjà été accusée réception.')
        return redirect('staff_request_detail', uuid=uuid)

    # Changer le statut
    old_status = request_obj.status
    request_obj.status = 'received'
    request_obj.save()

    # Créer log d'audit
    AuditLog.objects.create(
        request=request_obj,
        action='acknowledge',
        from_status=old_status,
        to_status=request_obj.status,
        actor=request.user,
        note="Requête accusée réception"
    )

    # Notifier l'étudiant
    Notification.objects.create(
        user=request_obj.student.user,
        title="Requête reçue",
        body=f"Votre requête pour {request_obj.subject.name} a été prise en charge par {request.user.get_full_name()}",
        link=f"/student/requests/{request_obj.id}/"
    )

    messages.success(request, 'Requête accusée réception avec succès.')
    return redirect('staff_request_detail', uuid=uuid)


@login_required
def staff_decision_request(request, uuid):
    """Prendre une décision sur une requête (received → approved/rejected)"""
    if not hasattr(request.user, 'lecturer_profile'):
        messages.error(request, 'Accès réservé au personnel enseignant.')
        return redirect('home')

    request_obj = get_object_or_404(Request, id=uuid, assigned_to=request.user)

    if request_obj.status not in ['received', 'sent']:
        messages.warning(request, 'Une décision a déjà été prise pour cette requête.')
        return redirect('staff_request_detail', uuid=uuid)

    if request.method == 'POST':
        form = DecisionForm(request.POST)
        if form.is_valid():
            decision_status = form.cleaned_data['status']
            reason = form.cleaned_data['reason']

            # Mettre à jour le statut
            old_status = request_obj.status
            request_obj.status = decision_status
            request_obj.save()

            # Créer log d'audit
            AuditLog.objects.create(
                request=request_obj,
                action='decision',
                from_status=old_status,
                to_status=request_obj.status,
                actor=request.user,
                note=reason
            )

            # Si rejetée, créer le résultat final
            if decision_status == 'rejected':
                RequestResult.objects.create(
                    request=request_obj,
                    status='rejected',
                    reason=reason,
                    created_by=request.user
                )
                request_obj.status = 'done'
                request_obj.save()

            # Notifier l'étudiant
            Notification.objects.create(
                user=request_obj.student.user,
                title=f"Requête {'approuvée' if decision_status == 'approved' else 'rejetée'}",
                body=f"Votre requête pour {request_obj.subject.name} a été {request_obj.get_status_display().lower()}",
                link=f"/student/requests/{request_obj.id}/"
            )

            messages.success(request, f'Requête {request_obj.get_status_display()} avec succès.')
            return redirect('staff_request_detail', uuid=uuid)
    else:
        form = DecisionForm()

    context = {
        'request_obj': request_obj,
        'form': form,
    }

    return render(request, 'staff/decision_form.html', context)


@login_required
def staff_send_to_cellule(request, uuid):
    """Envoyer une requête à la cellule informatique (approved → in_cellule)"""
    if not hasattr(request.user, 'lecturer_profile'):
        messages.error(request, 'Accès réservé au personnel enseignant.')
        return redirect('home')

    request_obj = get_object_or_404(Request, id=uuid, assigned_to=request.user)

    if request_obj.status != 'approved':
        messages.warning(request, 'Seules les requêtes approuvées peuvent être envoyées à la cellule.')
        return redirect('staff_request_detail', uuid=uuid)

    # Changer le statut
    old_status = request_obj.status
    request_obj.status = 'in_cellule'
    request_obj.save()

    # Créer log d'audit
    AuditLog.objects.create(
        request=request_obj,
        action='send_to_cellule',
        from_status=old_status,
        to_status=request_obj.status,
        actor=request.user,
        note="Envoyée à la cellule informatique"
    )

    # Notifier tous les membres de la cellule
    from django.contrib.auth.models import User
    cellule_users = User.objects.filter(groups__name='Cellule')
    for cellule_user in cellule_users:
        Notification.objects.create(
            user=cellule_user,
            title="Nouvelle requête en cellule",
            body=f"Requête de {request_obj.student_name} pour {request_obj.subject.name}",
            link=f"/cellule/requests/{request_obj.id}/"
        )

    messages.success(request, 'Requête envoyée à la cellule informatique.')
    return redirect('staff_request_detail', uuid=uuid)


@login_required
def staff_complete_request(request, uuid):
    """Compléter une requête (returned → done)"""
    if not hasattr(request.user, 'lecturer_profile'):
        messages.error(request, 'Accès réservé au personnel enseignant.')
        return redirect('home')

    request_obj = get_object_or_404(Request, id=uuid, assigned_to=request.user)

    if request_obj.status != 'returned':
        messages.warning(request, 'Seules les requêtes retournées peuvent être complétées.')
        return redirect('staff_request_detail', uuid=uuid)

    if request.method == 'POST':
        form = CompleteForm(request.POST)
        if form.is_valid():
            new_score = form.cleaned_data.get('new_score')
            comment = form.cleaned_data.get('comment')

            # Créer le résultat final
            RequestResult.objects.create(
                request=request_obj,
                status='completed',
                new_score=new_score,
                reason=comment,
                created_by=request.user
            )

            # Mettre à jour le statut
            old_status = request_obj.status
            request_obj.status = 'done'
            request_obj.save()

            # Créer log d'audit
            AuditLog.objects.create(
                request=request_obj,
                action='complete',
                from_status=old_status,
                to_status=request_obj.status,
                actor=request.user,
                note=f"Requête terminée. Nouvelle note: {new_score}" if new_score else "Requête terminée"
            )

            # Notifier l'étudiant
            Notification.objects.create(
                user=request_obj.student.user,
                title="Requête terminée",
                body=f"Votre requête pour {request_obj.subject.name} a été traitée et terminée",
                link=f"/student/requests/{request_obj.id}/"
            )

            messages.success(request, 'Requête complétée avec succès.')
            return redirect('staff_request_detail', uuid=uuid)
    else:
        form = CompleteForm()

    context = {
        'request_obj': request_obj,
        'form': form,
    }

    return render(request, 'staff/complete_form.html', context)
