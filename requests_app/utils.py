import qrcode
from io import BytesIO
import base64
from django.urls import reverse


def generate_qr_code(request_obj, request=None):
    """
    Génère un QR code pour une requête

    Args:
        request_obj: Instance de Request
        request: HttpRequest pour construire l'URL absolue

    Returns:
        str: Data URI de l'image QR code
    """
    # Construire l'URL publique de la requête
    path = reverse('public_request_view', kwargs={'uuid': str(request_obj.id)})

    # URL complète
    if request:
        url = request.build_absolute_uri(path)
    else:
        url = f"http://localhost:8000{path}"

    # Créer le QR code
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(url)
    qr.make(fit=True)

    # Générer l'image
    img = qr.make_image(fill_color="black", back_color="white")

    # Convertir en base64
    buffer = BytesIO()
    img.save(buffer, format='PNG')
    img_str = base64.b64encode(buffer.getvalue()).decode()

    return f"data:image/png;base64,{img_str}"


def get_status_badge_class(status):
    """Retourne la classe CSS pour le badge de statut"""
    status_classes = {
        'sent': 'badge-sent',
        'received': 'badge-received',
        'approved': 'badge-approved',
        'rejected': 'badge-rejected',
        'in_cellule': 'badge-in_cellule',
        'returned': 'badge-returned',
        'done': 'badge-done',
    }
    return status_classes.get(status, 'badge-sent')


def get_progress_steps():
    """Retourne les étapes du workflow"""
    return [
        {'key': 'sent', 'label': 'Envoyée', 'icon': '📤'},
        {'key': 'received', 'label': 'Reçue', 'icon': '👀'},
        {'key': 'approved', 'label': 'Approuvée', 'icon': '✓'},
        {'key': 'in_cellule', 'label': 'En cellule', 'icon': '💻'},
        {'key': 'returned', 'label': 'Retournée', 'icon': '🔄'},
        {'key': 'done', 'label': 'Terminée', 'icon': '✅'},
    ]


def get_current_step_index(status):
    """Retourne l'index de l'étape actuelle"""
    steps = ['sent', 'received', 'approved', 'in_cellule', 'returned', 'done']

    # Cas spéciaux
    if status == 'rejected':
        return steps.index('done')

    try:
        return steps.index(status)
    except ValueError:
        return 0


def can_user_action_request(user, request_obj, action):
    """
    Vérifie si un utilisateur peut effectuer une action sur une requête

    Args:
        user: User instance
        request_obj: Request instance
        action: str (acknowledge, decision, send_to_cellule, return_from_cellule, complete)

    Returns:
        bool: True si l'action est autorisée
    """
    # Admin peut tout
    if user.is_superuser:
        return True

    # Vérifier les permissions par action
    if action == 'acknowledge':
        # Peut marquer comme reçue si assigné et status=sent
        return (request_obj.assigned_to == user and
                request_obj.status == 'sent')

    elif action == 'decision':
        # Peut décider si assigné et status in [sent, received]
        return (request_obj.assigned_to == user and
                request_obj.status in ['sent', 'received'])

    elif action == 'send_to_cellule':
        # Peut envoyer à la cellule si assigné et status=approved
        return (request_obj.assigned_to == user and
                request_obj.status == 'approved')

    elif action == 'return_from_cellule':
        # Cellule peut retourner si status=in_cellule (via group or lecturer flag)
        is_cellule = user.groups.filter(name='cellule_informatique').exists()
        if not is_cellule and hasattr(user, 'lecturer_profile'):
            is_cellule = user.lecturer_profile.cellule_informatique
        return is_cellule and request_obj.status == 'in_cellule'

    elif action == 'complete':
        # Peut finaliser si assigné et status in [returned, approved]
        return (request_obj.assigned_to == user and
                request_obj.status in ['returned', 'approved'])

    return False
