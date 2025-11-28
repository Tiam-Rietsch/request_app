from django.shortcuts import render, get_object_or_404
from .models import Request


def public_request_view(request, uuid):
    """Vue publique d'une requête accessible via QR code"""
    request_obj = get_object_or_404(Request, id=uuid)

    # Générer le QR code pour cette page
    from .utils import generate_qr_code
    qr_code = generate_qr_code(request_obj, request)

    context = {
        'request_obj': request_obj,
        'qr_code': qr_code,
    }

    return render(request, 'public/request_view.html', context)
