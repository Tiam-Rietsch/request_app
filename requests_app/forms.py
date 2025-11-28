from django import forms
from django.contrib.auth.models import User
from django.contrib.auth.forms import AuthenticationForm
from .models import Student, ClassLevel, Field, Axis, Subject, Request


class StudentSignupForm(forms.Form):
    """Formulaire d'inscription pour les étudiants"""
    first_name = forms.CharField(
        max_length=150,
        label="Prénom",
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Entrez votre prénom'})
    )
    last_name = forms.CharField(
        max_length=150,
        label="Nom",
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Entrez votre nom'})
    )
    matricule = forms.CharField(
        max_length=50,
        label="Matricule",
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Ex: 20GL1234'})
    )
    class_level = forms.ModelChoiceField(
        queryset=ClassLevel.objects.all(),
        label="Niveau",
        widget=forms.Select(attrs={'class': 'form-control form-select'})
    )
    field = forms.ModelChoiceField(
        queryset=Field.objects.all(),
        label="Filière",
        widget=forms.Select(attrs={'class': 'form-control form-select'})
    )
    password = forms.CharField(
        label="Mot de passe",
        widget=forms.PasswordInput(attrs={'class': 'form-control', 'placeholder': 'Minimum 8 caractères'})
    )
    confirm_password = forms.CharField(
        label="Confirmer le mot de passe",
        widget=forms.PasswordInput(attrs={'class': 'form-control', 'placeholder': 'Retapez le mot de passe'})
    )

    def clean_matricule(self):
        matricule = self.cleaned_data.get('matricule')
        if User.objects.filter(username=matricule).exists():
            raise forms.ValidationError("Ce matricule est déjà utilisé.")
        if Student.objects.filter(matricule=matricule).exists():
            raise forms.ValidationError("Ce matricule est déjà enregistré.")
        return matricule

    def clean(self):
        cleaned_data = super().clean()
        password = cleaned_data.get('password')
        confirm_password = cleaned_data.get('confirm_password')

        if password and confirm_password and password != confirm_password:
            raise forms.ValidationError("Les mots de passe ne correspondent pas.")

        if password and len(password) < 8:
            raise forms.ValidationError("Le mot de passe doit contenir au moins 8 caractères.")

        return cleaned_data


class LoginForm(AuthenticationForm):
    """Formulaire de connexion personnalisé"""
    username = forms.CharField(
        label="Matricule",
        widget=forms.TextInput(attrs={
            'class': 'form-control',
            'placeholder': 'Entrez votre matricule',
            'autofocus': True
        })
    )
    password = forms.CharField(
        label="Mot de passe",
        widget=forms.PasswordInput(attrs={
            'class': 'form-control',
            'placeholder': 'Entrez votre mot de passe'
        })
    )


class RequestCreateForm(forms.ModelForm):
    """Formulaire de création de requête"""
    class Meta:
        model = Request
        fields = ['class_level', 'field', 'axis', 'subject', 'type', 'description']
        widgets = {
            'class_level': forms.Select(attrs={
                'class': 'form-control form-select',
                'hx-get': '/htmx/get-fields/',
                'hx-target': '#id_field_wrapper',
                'hx-trigger': 'change'
            }),
            'field': forms.Select(attrs={
                'class': 'form-control form-select',
                'hx-get': '/htmx/get-subjects/',
                'hx-target': '#id_subject_wrapper',
                'hx-trigger': 'change'
            }),
            'axis': forms.Select(attrs={'class': 'form-control form-select'}),
            'subject': forms.Select(attrs={'class': 'form-control form-select'}),
            'type': forms.Select(attrs={'class': 'form-control form-select'}),
            'description': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 5,
                'placeholder': 'Décrivez en détail votre contestation...'
            }),
        }
        labels = {
            'class_level': 'Niveau',
            'field': 'Filière',
            'axis': 'Axe (optionnel)',
            'subject': 'Matière',
            'type': 'Type de requête',
            'description': 'Description',
        }

    def __init__(self, *args, **kwargs):
        user = kwargs.pop('user', None)
        super().__init__(*args, **kwargs)

        # Si l'utilisateur est étudiant, pré-remplir niveau et filière
        if user and hasattr(user, 'student_profile'):
            student = user.student_profile
            self.fields['class_level'].initial = student.class_level
            if student.field:
                self.fields['field'].initial = student.field
                # Filtrer les matières par filière
                self.fields['subject'].queryset = Subject.objects.filter(
                    field=student.field,
                    class_levels=student.class_level
                )
            # Filtrer les axes par filière
            if student.field:
                self.fields['axis'].queryset = Axis.objects.filter(field=student.field)


class DecisionForm(forms.Form):
    """Formulaire de décision (approuver/rejeter)"""
    decision = forms.ChoiceField(
        choices=[('approved', 'Approuver'), ('rejected', 'Rejeter')],
        widget=forms.RadioSelect(attrs={'class': 'form-check-input'}),
        label="Décision"
    )
    reason = forms.CharField(
        required=False,
        widget=forms.Textarea(attrs={
            'class': 'form-control',
            'rows': 3,
            'placeholder': 'Raison de la décision (optionnelle pour approbation, recommandée pour rejet)'
        }),
        label="Raison"
    )


class CompleteForm(forms.Form):
    """Formulaire de finalisation"""
    status = forms.ChoiceField(
        choices=[('accepted', 'Acceptée'), ('rejected', 'Rejetée')],
        widget=forms.RadioSelect(attrs={'class': 'form-check-input'}),
        label="Résultat final"
    )
    new_score = forms.DecimalField(
        required=False,
        max_digits=5,
        decimal_places=2,
        widget=forms.NumberInput(attrs={
            'class': 'form-control',
            'placeholder': 'Ex: 15.50',
            'step': '0.01'
        }),
        label="Nouvelle note (si applicable)"
    )
    reason = forms.CharField(
        required=False,
        widget=forms.Textarea(attrs={
            'class': 'form-control',
            'rows': 3,
            'placeholder': 'Raison ou commentaire'
        }),
        label="Commentaire"
    )
