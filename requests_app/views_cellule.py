from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.db.models import Count
from .models import Request, AuditLog, Notification


def is_cellule_member(user):
    """Vérifier si l'utilisateur fait partie de la cellule informatique"""
    return user.groups.filter(name='Cellule').exists() or user.is_superuser


@login_required
def cellule_dashboard(request):
    """Dashboard pour la cellule informatique"""
    if not is_cellule_member(request.user):
        messages.error(request, 'Accès réservé aux membres de la cellule informatique.')
        return redirect('home')

    # Statistiques
    all_requests = Request.objects.filter(status__in=['in_cellule', 'returned'])
    total_requests = all_requests.count()
    in_cellule_count = Request.objects.filter(status='in_cellule').count()
    returned_count = Request.objects.filter(status='returned').count()

    # Requêtes récentes en cellule
    recent_requests = Request.objects.filter(status='in_cellule').order_by('-submitted_at')[:5]

    # Statistiques historiques (toutes les requêtes passées par la cellule)
    all_time_count = Request.objects.filter(
        status__in=['in_cellule', 'returned', 'done']
    ).exclude(status='sent').exclude(status='received').exclude(status='approved').count()

    context = {
        'total_requests': total_requests,
        'in_cellule_count': in_cellule_count,
        'returned_count': returned_count,
        'recent_requests': recent_requests,
        'all_time_count': all_time_count,
    }

    return render(request, 'cellule/dashboard.html', context)


@login_required
def cellule_requests_list(request):
    """Liste des requêtes en cellule"""
    if not is_cellule_member(request.user):
        messages.error(request, 'Accès réservé aux membres de la cellule informatique.')
        return redirect('home')

    # Filtres
    status_filter = request.GET.get('status', '')
    type_filter = request.GET.get('type', '')

    # Base queryset - uniquement les requêtes en cellule ou retournées
    requests_list = Request.objects.filter(
        status__in=['in_cellule', 'returned']
    ).order_by('-submitted_at')

    # Appliquer les filtres
    if status_filter:
        requests_list = requests_list.filter(status=status_filter)
    if type_filter:
        requests_list = requests_list.filter(type=type_filter)

    context = {
        'requests_list': requests_list,
        'status_filter': status_filter,
        'type_filter': type_filter,
    }

    return render(request, 'cellule/requests_list.html', context)


@login_required
def cellule_request_detail(request, uuid):
    """Détail d'une requête pour la cellule"""
    if not is_cellule_member(request.user):
        messages.error(request, 'Accès réservé aux membres de la cellule informatique.')
        return redirect('home')

    # Vérifier que la requête est en cellule ou retournée
    request_obj = get_object_or_404(
        Request,
        id=uuid,
        status__in=['in_cellule', 'returned']
    )

    from .utils import generate_qr_code
    qr_code = generate_qr_code(request_obj, request)

    context = {
        'request_obj': request_obj,
        'qr_code': qr_code,
    }

    return render(request, 'cellule/request_detail.html', context)


@login_required
def cellule_return_request(request, uuid):
    """Retourner une requête au responsable (in_cellule → returned)"""
    if not is_cellule_member(request.user):
        messages.error(request, 'Accès réservé aux membres de la cellule informatique.')
        return redirect('home')

    request_obj = get_object_or_404(Request, id=uuid, status='in_cellule')

    if request.method == 'POST':
        note = request.POST.get('note', '')

        # Changer le statut
        old_status = request_obj.status
        request_obj.status = 'returned'
        request_obj.save()

        # Créer log d'audit
        AuditLog.objects.create(
            request=request_obj,
            action='return_from_cellule',
            from_status=old_status,
            to_status=request_obj.status,
            actor=request.user,
            note=note or "Requête retournée de la cellule informatique"
        )

        # Notifier le responsable assigné
        if request_obj.assigned_to:
            Notification.objects.create(
                user=request_obj.assigned_to,
                title="Requête retournée de la cellule",
                body=f"La requête de {request_obj.student_name} pour {request_obj.subject.name} a été traitée et retournée",
                link=f"/staff/requests/{request_obj.id}/"
            )

        messages.success(request, 'Requête retournée au responsable avec succès.')
        return redirect('cellule_request_detail', uuid=uuid)

    context = {
        'request_obj': request_obj,
    }

    return render(request, 'cellule/return_form.html', context)
