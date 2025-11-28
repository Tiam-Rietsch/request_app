from django.shortcuts import render, redirect
from django.contrib.auth import login, logout, authenticate
from django.contrib.auth.models import User
from django.contrib import messages
from django.db import transaction
from .forms import StudentSignupForm, LoginForm
from .models import Student


def signup_view(request):
    """Inscription des étudiants"""
    if request.user.is_authenticated:
        return redirect('home')

    if request.method == 'POST':
        form = StudentSignupForm(request.POST)
        if form.is_valid():
            try:
                with transaction.atomic():
                    # Créer l'utilisateur avec le matricule comme username
                    user = User.objects.create_user(
                        username=form.cleaned_data['matricule'],
                        first_name=form.cleaned_data['first_name'],
                        last_name=form.cleaned_data['last_name'],
                        password=form.cleaned_data['password']
                    )

                    # Créer le profil étudiant
                    Student.objects.create(
                        user=user,
                        matricule=form.cleaned_data['matricule'],
                        class_level=form.cleaned_data['class_level'],
                        field=form.cleaned_data['field']
                    )

                    # Connecter automatiquement
                    login(request, user)

                    messages.success(request, f'Bienvenue {user.get_full_name()}! Votre compte a été créé avec succès.')
                    return redirect('student_dashboard')

            except Exception as e:
                messages.error(request, f'Une erreur est survenue lors de l\'inscription: {str(e)}')
        else:
            messages.error(request, 'Veuillez corriger les erreurs ci-dessous.')
    else:
        form = StudentSignupForm()

    return render(request, 'auth/signup.html', {'form': form})


def login_view(request):
    """Connexion"""
    if request.user.is_authenticated:
        # Redirect to appropriate dashboard
        if hasattr(request.user, 'student_profile'):
            return redirect('student_dashboard')
        elif hasattr(request.user, 'lecturer_profile'):
            return redirect('staff_dashboard')
        elif request.user.groups.filter(name='Cellule').exists():
            return redirect('cellule_dashboard')
        elif request.user.is_superuser:
            return redirect('/admin/')
        return redirect('home')

    if request.method == 'POST':
        form = LoginForm(request, data=request.POST)
        if form.is_valid():
            username = form.cleaned_data.get('username')
            password = form.cleaned_data.get('password')
            user = authenticate(username=username, password=password)

            if user is not None:
                login(request, user)

                # Rediriger selon le rôle
                if hasattr(user, 'student_profile'):
                    messages.success(request, f'Bienvenue {user.get_full_name()}!')
                    return redirect('student_dashboard')
                elif hasattr(user, 'lecturer_profile'):
                    messages.success(request, f'Bienvenue {user.get_full_name()}!')
                    return redirect('staff_dashboard')
                elif user.groups.filter(name='Cellule').exists():
                    messages.success(request, f'Bienvenue {user.get_full_name()}!')
                    return redirect('cellule_dashboard')
                elif user.is_superuser:
                    messages.success(request, f'Bienvenue Administrateur!')
                    return redirect('/admin/')
                else:
                    messages.warning(request, 'Connexion réussie.')
                    return redirect('home')
            else:
                messages.error(request, 'Matricule ou mot de passe incorrect.')
        else:
            messages.error(request, 'Matricule ou mot de passe incorrect.')
    else:
        form = LoginForm()

    return render(request, 'auth/login.html', {'form': form})


def logout_view(request):
    """Déconnexion"""
    logout(request)
    messages.info(request, 'Vous avez été déconnecté avec succès.')
    return redirect('login')


def home_view(request):
    """Page d'accueil"""
    if request.user.is_authenticated:
        # Rediriger vers le dashboard approprié
        if hasattr(request.user, 'student_profile'):
            return redirect('student_dashboard')
        elif hasattr(request.user, 'lecturer_profile'):
            return redirect('staff_dashboard')
        elif request.user.groups.filter(name='Cellule').exists():
            return redirect('cellule_dashboard')
        elif request.user.is_superuser:
            return redirect('/admin/')

    return render(request, 'home.html')
