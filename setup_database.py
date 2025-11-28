"""
Database Setup Script
Clears existing data and creates initial setup for the Request Management System

Usage:
    python setup_database.py
"""

import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'requests_system.settings')
django.setup()

from django.contrib.auth.models import User, Group
from django.db import transaction
from requests_app.models import ClassLevel, Field, Axis, Subject, Student, Lecturer


def clear_database():
    """Clear all existing data"""
    print("Clearing existing data...")

    # Delete in reverse order of dependencies
    Lecturer.objects.all().delete()
    Student.objects.all().delete()
    Subject.objects.all().delete()
    Axis.objects.all().delete()
    Field.objects.all().delete()
    ClassLevel.objects.all().delete()

    # Delete users except superusers
    User.objects.filter(is_superuser=False).delete()

    # Delete groups
    Group.objects.all().delete()

    print("Database cleared successfully")


def create_basic_structure():
    """Create ClassLevel, Field, and Axis"""
    print("\nCreating basic structure...")

    # Create ClassLevel
    niveau3, _ = ClassLevel.objects.get_or_create(
        name="Niveau 3",
        defaults={'order': 3}
    )
    print(f"  - ClassLevel: {niveau3.name}")

    # Create Field
    git, _ = Field.objects.get_or_create(
        name="GIT"
    )
    print(f"  - Field: {git.name}")

    # Create Axis
    glo, _ = Axis.objects.get_or_create(
        name="GLO",
        defaults={'field': git}
    )
    print(f"  - Axis: {glo.name}")

    return niveau3, git, glo


def create_cellule_group():
    """Create Cellule group"""
    print("\nCreating Cellule group...")

    cellule_group, created = Group.objects.get_or_create(name='Cellule')

    if created:
        print("  - Cellule group created")
    else:
        print("  - Cellule group already exists")

    return cellule_group


def create_teachers(git_field):
    """Create teacher accounts with subjects"""
    print("\nCreating teachers...")

    teachers_data = [
        {
            'username': 'manda.abega',
            'first_name': 'Manda',
            'last_name': 'Abega',
            'subject': 'Ingénierie des Modèles',
            'is_hod': False
        },
        {
            'username': 'ihonock.jeanluc',
            'first_name': 'Ihonock',
            'last_name': 'Jean Luc',
            'subject': 'Cloud Computing',
            'is_hod': False
        },
        {
            'username': 'malong.yanick',
            'first_name': 'Malong',
            'last_name': 'Yanick',
            'subject': 'Machine Learning',
            'is_hod': False
        },
        {
            'username': 'maka.ebenezer',
            'first_name': 'Maka Maka',
            'last_name': 'Ebenezer',
            'subject': None,  # HOD - no specific subject
            'is_hod': True
        }
    ]

    password = 'ProjetGloPass123'
    teachers = []

    for teacher_data in teachers_data:
        # Create user account
        user, created = User.objects.get_or_create(
            username=teacher_data['username'],
            defaults={
                'first_name': teacher_data['first_name'],
                'last_name': teacher_data['last_name']
            }
        )

        if created:
            user.set_password(password)
            user.save()
            print(f"  - User created: {user.get_full_name()} ({user.username})")
        else:
            # Update password even if user exists
            user.set_password(password)
            user.first_name = teacher_data['first_name']
            user.last_name = teacher_data['last_name']
            user.save()
            print(f"  - User updated: {user.get_full_name()} ({user.username})")

        # Create lecturer profile
        lecturer, created = Lecturer.objects.get_or_create(
            user=user,
            defaults={
                'field': git_field,
                'is_hod': teacher_data['is_hod']
            }
        )

        if not created:
            lecturer.field = git_field
            lecturer.is_hod = teacher_data['is_hod']
            lecturer.save()

        teachers.append({
            'lecturer': lecturer,
            'subject_name': teacher_data['subject']
        })

        if teacher_data['is_hod']:
            print(f"    → HOD of {git_field.name}")
        else:
            print(f"    → Teacher")

    return teachers


def create_subjects(niveau3, git, glo, teachers):
    """Create subjects and assign to teachers"""
    print("\nCreating subjects...")

    subjects_created = []

    for teacher_info in teachers:
        if teacher_info['subject_name']:  # Skip HOD (no specific subject)
            subject, created = Subject.objects.get_or_create(
                name=teacher_info['subject_name'],
                defaults={
                    'class_level': niveau3,
                    'field': git,
                    'axis': glo
                }
            )

            if not created:
                subject.class_level = niveau3
                subject.field = git
                subject.axis = glo
                subject.save()

            # Assign teacher to subject
            subject.lecturers.add(teacher_info['lecturer'])
            subject.save()

            subjects_created.append(subject)
            print(f"  - Subject: {subject.name}")
            print(f"    Assigned to: {teacher_info['lecturer'].user.get_full_name()}")

    return subjects_created


def create_cellule_user(cellule_group):
    """Create cellule user"""
    print("\nCreating Cellule user...")

    user, created = User.objects.get_or_create(
        username='mimbeu.yves',
        defaults={
            'first_name': 'Mimbeu',
            'last_name': 'Yves'
        }
    )

    password = 'ProjetGloPass123'

    if created:
        user.set_password(password)
        user.save()
        print(f"  - User created: {user.get_full_name()} ({user.username})")
    else:
        user.set_password(password)
        user.first_name = 'Mimbeu'
        user.last_name = 'Yves'
        user.save()
        print(f"  - User updated: {user.get_full_name()} ({user.username})")

    # Add to Cellule group
    user.groups.add(cellule_group)
    user.save()
    print(f"    Added to Cellule group")

    return user


def print_summary():
    """Print summary of created data"""
    print("\n" + "="*60)
    print("DATABASE SETUP COMPLETE")
    print("="*60)

    print("\nSUMMARY:")
    print(f"  - ClassLevels: {ClassLevel.objects.count()}")
    print(f"  - Fields: {Field.objects.count()}")
    print(f"  - Axes: {Axis.objects.count()}")
    print(f"  - Subjects: {Subject.objects.count()}")
    print(f"  - Lecturers: {Lecturer.objects.count()}")
    print(f"  - Groups: {Group.objects.count()}")

    print("\nLOGIN CREDENTIALS:")
    print("\n  TEACHERS:")
    print("  --------")
    print("  Username: manda.abega       | Password: ProjetGloPass123 | Subject: Ingénierie des Modèles")
    print("  Username: ihonock.jeanluc   | Password: ProjetGloPass123 | Subject: Cloud Computing")
    print("  Username: malong.yanick     | Password: ProjetGloPass123 | Subject: Machine Learning")
    print("  Username: maka.ebenezer     | Password: ProjetGloPass123 | Role: HOD (Chef de Département)")

    print("\n  CELLULE:")
    print("  --------")
    print("  Username: mimbeu.yves       | Password: ProjetGloPass123 | Role: Cellule Informatique")

    print("\n  STUDENTS:")
    print("  --------")
    print("  Students can register via: http://localhost:8000/signup/")
    print("  Or create via Django Admin: http://localhost:8000/admin/")

    print("\nNEXT STEPS:")
    print("  1. Run the development server:")
    print("     python manage.py runserver")
    print("\n  2. Access the application:")
    print("     http://localhost:8000/")
    print("\n  3. Create student accounts:")
    print("     http://localhost:8000/signup/")
    print("\n  4. Login as teacher to test workflow:")
    print("     http://localhost:8000/login/")

    print("\n" + "="*60)


@transaction.atomic
def main():
    """Main setup function"""
    print("="*60)
    print("STARTING DATABASE SETUP")
    print("="*60)

    # Clear existing data
    clear_database()

    # Create basic structure
    niveau3, git, glo = create_basic_structure()

    # Create Cellule group
    cellule_group = create_cellule_group()

    # Create teachers
    teachers = create_teachers(git)

    # Create subjects
    subjects = create_subjects(niveau3, git, glo, teachers)

    # Create cellule user
    cellule_user = create_cellule_user(cellule_group)

    # Print summary
    print_summary()


if __name__ == '__main__':
    try:
        main()
    except Exception as e:
        print(f"\nERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        exit(1)
