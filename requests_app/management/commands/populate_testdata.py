from django.core.management.base import BaseCommand
from django.contrib.auth.models import User, Group
from requests_app.models import (
    ClassLevel, Field, Axis, Subject, Lecturer, Student
)


class Command(BaseCommand):
    help = 'Populate database with test data'

    def handle(self, *args, **kwargs):
        self.stdout.write('Starting to populate test data...')

        # Create groups
        self.stdout.write('Creating groups...')
        cellule_group, _ = Group.objects.get_or_create(name='cellule_informatique')
        self.stdout.write(self.style.SUCCESS('✓ Groups created'))

        # Create ClassLevels
        self.stdout.write('Creating class levels...')
        levels_data = [
            ('L1', 1),
            ('L2', 2),
            ('L3', 3),
            ('M1', 4),
            ('M2', 5),
        ]

        levels = {}
        for name, order in levels_data:
            level, created = ClassLevel.objects.get_or_create(
                name=name,
                defaults={'order': order}
            )
            levels[name] = level
            if created:
                self.stdout.write(f'  Created: {name}')

        self.stdout.write(self.style.SUCCESS('✓ Class levels created'))

        # Create Fields
        self.stdout.write('Creating fields...')
        fields_data = [
            ('GL', 'Génie Logiciel', ['L2', 'L3', 'M1', 'M2']),
            ('GI', 'Génie Informatique', ['L2', 'L3', 'M1', 'M2']),
            ('RT', 'Réseaux et Télécommunications', ['L2', 'L3', 'M1', 'M2']),
        ]

        fields = {}
        for code, name, allowed_levels in fields_data:
            field, created = Field.objects.get_or_create(
                code=code,
                defaults={'name': name}
            )
            # Add allowed levels
            for level_name in allowed_levels:
                field.allowed_levels.add(levels[level_name])
            fields[code] = field
            if created:
                self.stdout.write(f'  Created: {code} - {name}')

        self.stdout.write(self.style.SUCCESS('✓ Fields created'))

        # Create Axes
        self.stdout.write('Creating axes...')
        axes_data = [
            ('GL', 'SIA', 'Systèmes d\'Information et Applications'),
            ('GL', 'IA', 'Intelligence Artificielle'),
            ('GI', 'SE', 'Systèmes Embarqués'),
            ('GI', 'INF', 'Informatique Générale'),
            ('RT', 'RSX', 'Réseaux'),
            ('RT', 'TEL', 'Télécommunications'),
        ]

        for field_code, axis_code, axis_name in axes_data:
            axis, created = Axis.objects.get_or_create(
                code=axis_code,
                field=fields[field_code],
                defaults={'name': axis_name}
            )
            if created:
                self.stdout.write(f'  Created: {field_code}:{axis_code} - {axis_name}')

        self.stdout.write(self.style.SUCCESS('✓ Axes created'))

        # Create Subjects
        self.stdout.write('Creating subjects...')
        subjects_data = [
            # GL
            ('MATH101', 'Mathématiques I', 'GL', ['L2', 'L3']),
            ('PROG201', 'Programmation Orientée Objet', 'GL', ['L2', 'L3']),
            ('WEB301', 'Développement Web Avancé', 'GL', ['L3', 'M1']),
            ('BDD202', 'Bases de Données', 'GL', ['L2', 'L3']),
            ('ALGO101', 'Algorithmes et Structures de Données', 'GL', ['L2']),

            # GI
            ('ELEC101', 'Électronique Numérique', 'GI', ['L2', 'L3']),
            ('SYS201', 'Systèmes d\'Exploitation', 'GI', ['L2', 'L3']),
            ('EMBED301', 'Systèmes Embarqués', 'GI', ['L3', 'M1']),

            # RT
            ('RSX101', 'Réseaux Informatiques I', 'RT', ['L2', 'L3']),
            ('TEL201', 'Télécommunications', 'RT', ['L2', 'L3']),
            ('SEC301', 'Sécurité des Réseaux', 'RT', ['L3', 'M1']),
        ]

        for code, name, field_code, class_levels in subjects_data:
            subject, created = Subject.objects.get_or_create(
                code=code,
                field=fields[field_code],
                defaults={'name': name}
            )
            # Add class levels
            for level_name in class_levels:
                subject.class_levels.add(levels[level_name])

            if created:
                self.stdout.write(f'  Created: {code} - {name}')

        self.stdout.write(self.style.SUCCESS('✓ Subjects created'))

        # Create Users
        self.stdout.write('Creating users...')

        # Students
        students_data = [
            ('20GL1001', 'Kouam', 'Pierre', 'pierre.kouam', 'L3', 'GL'),
            ('20GL1002', 'Ngo', 'Marie', 'marie.ngo', 'L3', 'GL'),
            ('20GI1001', 'Tchoumi', 'Jean', 'jean.tchoumi', 'L2', 'GI'),
            ('20RT1001', 'Kamga', 'Sarah', 'sarah.kamga', 'L3', 'RT'),
        ]

        for matricule, last_name, first_name, username, level_name, field_code in students_data:
            user, user_created = User.objects.get_or_create(
                username=username,
                defaults={
                    'first_name': first_name,
                    'last_name': last_name,
                    'email': f'{username}@example.com'
                }
            )
            if user_created:
                user.set_password('password123')
                user.save()

            student, created = Student.objects.get_or_create(
                matricule=matricule,
                defaults={
                    'user': user,
                    'class_level': levels[level_name],
                    'field': fields[field_code]
                }
            )
            if created:
                self.stdout.write(f'  Created student: {matricule} - {first_name} {last_name}')

        # Lecturers
        lecturers_data = [
            ('Dr.', 'Mbida', 'Paul', 'paul.mbida', False, 'GL', ['PROG201', 'WEB301']),
            ('Prof.', 'Fokou', 'Anne', 'anne.fokou', True, 'GL', ['MATH101', 'BDD202']),  # HOD
            ('Dr.', 'Kamdem', 'Jacques', 'jacques.kamdem', False, 'GI', ['ELEC101', 'EMBED301']),
            ('Prof.', 'Ngono', 'Berthe', 'berthe.ngono', True, 'RT', ['RSX101', 'SEC301']),  # HOD
        ]

        for title, last_name, first_name, username, is_hod, field_code, subject_codes in lecturers_data:
            user, user_created = User.objects.get_or_create(
                username=username,
                defaults={
                    'first_name': f'{title} {first_name}',
                    'last_name': last_name,
                    'email': f'{username}@example.com',
                    'is_staff': True
                }
            )
            if user_created:
                user.set_password('password123')
                user.save()

            lecturer, created = Lecturer.objects.get_or_create(
                user=user,
                defaults={
                    'is_hod': is_hod,
                    'field': fields[field_code] if is_hod else None
                }
            )

            # Add subjects
            for subject_code in subject_codes:
                try:
                    subject = Subject.objects.get(code=subject_code)
                    lecturer.subjects.add(subject)
                except Subject.DoesNotExist:
                    pass

            if created:
                role = 'HOD' if is_hod else 'Lecturer'
                self.stdout.write(f'  Created {role}: {first_name} {last_name}')

        # Cellule members
        cellule_users_data = [
            ('Cellule', 'Tech1', 'cellule.tech1'),
            ('Cellule', 'Tech2', 'cellule.tech2'),
        ]

        for last_name, first_name, username in cellule_users_data:
            user, user_created = User.objects.get_or_create(
                username=username,
                defaults={
                    'first_name': first_name,
                    'last_name': last_name,
                    'email': f'{username}@example.com'
                }
            )
            if user_created:
                user.set_password('password123')
                user.save()
                user.groups.add(cellule_group)
                self.stdout.write(f'  Created cellule member: {first_name} {last_name}')

        self.stdout.write(self.style.SUCCESS('✓ Users created'))
        self.stdout.write(self.style.SUCCESS('\n========================================'))
        self.stdout.write(self.style.SUCCESS('Test data populated successfully!'))
        self.stdout.write(self.style.SUCCESS('========================================'))
        self.stdout.write('\nDefault password for all users: password123')
        self.stdout.write('\nStudent accounts:')
        self.stdout.write('  - pierre.kouam (L3 GL)')
        self.stdout.write('  - marie.ngo (L3 GL)')
        self.stdout.write('  - jean.tchoumi (L2 GI)')
        self.stdout.write('  - sarah.kamga (L3 RT)')
        self.stdout.write('\nLecturer/HOD accounts:')
        self.stdout.write('  - paul.mbida (Lecturer GL)')
        self.stdout.write('  - anne.fokou (HOD GL) ⭐')
        self.stdout.write('  - jacques.kamdem (Lecturer GI)')
        self.stdout.write('  - berthe.ngono (HOD RT) ⭐')
        self.stdout.write('\nCellule accounts:')
        self.stdout.write('  - cellule.tech1')
        self.stdout.write('  - cellule.tech2')
