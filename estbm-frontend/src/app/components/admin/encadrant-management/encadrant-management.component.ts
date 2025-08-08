

// import { Component, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { RouterModule } from '@angular/router';
// import { UserService } from '../../../services/user.service';
// import { ToastService } from '../../../services/toast.service';
// import { NavbarComponent } from '../../shared/navbar/navbar.component';
// import { User, CreateEncadrantRequest } from '../../../models/user.model';

// @Component({
//   selector: 'app-encadrant-management',
//   standalone: true,
//   imports: [CommonModule, FormsModule, RouterModule, NavbarComponent],
//   templateUrl: './encadrant-management.component.html',
//   styleUrls: ['./encadrant-management.component.scss']
// })
// export class EncadrantManagementComponent implements OnInit {
//   encadrants: User[] = [];
//   newEncadrant: CreateEncadrantRequest = {
//     nom: '',
//     prenom: '',
//     email: '',
//     telephone: '',
//     specialite: '',
//     password: ''
//   };

//   successMessage = '';
//   errorMessage = '';
//   loading = false;
//   loadingList = false;

//   specialites = [
//     'Génie Informatique',
//     'Génie Électrique',
//     'Génie Mécanique',
//     'Génie Civil',
//     'Génie Industriel',
//     'Génie Chimique',
//     'Génie des Procédés',
//     'Génie Énergétique'
//   ];

//   constructor(
//     private userService: UserService,
//     private toastService: ToastService
//   ) {}

//   ngOnInit(): void {
//     this.loadEncadrants();
    
//     // Animation cascade
//     setTimeout(() => {
//       this.animateElements();
//     }, 100);
//   }

//   loadEncadrants(): void {
//     this.loadingList = true;
//     this.userService.getEncadrants().subscribe({
//       next: (encadrants: User[]) => {
//         this.encadrants = encadrants;
//         this.loadingList = false;
//       },
//       error: (error: any) => {
//         this.loadingList = false;
//         this.toastService.error('Erreur lors du chargement des encadrants');
//         console.error('Erreur chargement encadrants:', error);
//       }
//     });
//   }

//   createEncadrant(): void {
//     this.loading = true;
//     this.errorMessage = '';
//     this.successMessage = '';

//     this.userService.createEncadrant(this.newEncadrant).subscribe({
//       next: (encadrant: User) => {
//         this.loading = false;
//         this.toastService.success('Encadrant créé avec succès !');
//         this.resetForm();
//         this.loadEncadrants();
//       },
//       error: (error: any) => {
//         this.loading = false;
//         this.toastService.error('Erreur lors de la création de l\'encadrant');
//         console.error('Erreur création encadrant:', error);
//       }
//     });
//   }

//   editEncadrant(encadrant: User): void {
//     this.toastService.info(`Modification de ${encadrant.nom} ${encadrant.prenom} (fonctionnalité à implémenter)`);
//   }

//   deleteEncadrant(id: number): void {
//     if (!confirm('Êtes-vous sûr de vouloir supprimer cet encadrant ?')) return;

//     this.userService.deleteEncadrant(id).subscribe({
//       next: () => {
//         this.toastService.success('Encadrant supprimé avec succès');
//         this.loadEncadrants();
//       },
//       error: (error: any) => {
//         this.toastService.error('Erreur lors de la suppression');
//         console.error('Erreur suppression encadrant:', error);
//       }
//     });
//   }

//   private resetForm(): void {
//     this.newEncadrant = {
//       nom: '',
//       prenom: '',
//       email: '',
//       telephone: '',
//       specialite: '',
//       password: ''
//     };
//   }

//   private animateElements(): void {
//     const cards = document.querySelectorAll('.management-card');
//     cards.forEach((card, index) => {
//       setTimeout(() => {
//         card.classList.add('animate-slideInFromBottom');
//       }, index * 150);
//     });
//   }
// }


import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { UserService } from '../../../services/user.service';
import { NotificationService } from '../../../services/notification.service';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { NotificationComponent } from '../../../shared/components/notification/notification.component';
import { User, CreateEncadrantRequest } from '../../../models/user.model';

@Component({
  selector: 'app-encadrant-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NavbarComponent],
  templateUrl: './encadrant-management.component.html',
  styleUrls: ['./encadrant-management.component.scss']
})
export class EncadrantManagementComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  encadrants: User[] = [];
  newEncadrant: CreateEncadrantRequest = {
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    specialite: '',
    password: ''
  };

  loading = false;
  loadingList = false;
  creating = false;
  deleting = false;

  specialites = [
    'Génie Informatique',
    'Génie Électrique',
    'Génie Mécanique',
    'Génie Civil',
    'Génie Industriel',
    'Génie Chimique',
    'Génie des Procédés',
    'Génie Énergétique',
    'Génie des Télécommunications',
    'Génie Logiciel',
    'Réseaux et Systèmes',
    'Intelligence Artificielle'
  ];
successMessage: any;
errorMessage: any;

  constructor(
    private userService: UserService,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.notificationService.info('Gestion Encadrants', 'Initialisation de la page de gestion des encadrants...');
    this.loadEncadrants();
    
    setTimeout(() => {
      this.animateElements();
    }, 100);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadEncadrants(): void {
    this.loadingList = true;
    this.notificationService.info('Chargement', 'Récupération de la liste des encadrants...');
    
    this.userService.getEncadrants()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (encadrants: User[]) => {
          this.encadrants = encadrants;
          this.loadingList = false;
          
          // Statistiques par spécialité
          const specialitesCount = this.getSpecialitesStats(encadrants);
          const statsMessage = Object.entries(specialitesCount)
            .map(([spec, count]) => `${spec}: ${count}`)
            .join(', ');
          
          this.notificationService.success(
            'Encadrants chargés', 
            `${encadrants.length} encadrants trouvés. Répartition: ${statsMessage}`
          );
          this.cdr.detectChanges();
        },
        error: (error: any) => {
          this.loadingList = false;
          const errorMsg = error.error?.message || 'Impossible de charger les encadrants';
          this.notificationService.error('Erreur de chargement', errorMsg);
          console.error('Erreur chargement encadrants:', error);
          this.cdr.detectChanges();
        }
      });
  }

  createEncadrant(): void {
    if (!this.validateEncadrantForm()) {
      return;
    }

    this.creating = true;
    this.notificationService.info(
      'Création en cours', 
      `Création du compte encadrant pour ${this.newEncadrant.prenom} ${this.newEncadrant.nom} - Spécialité: ${this.newEncadrant.specialite}`
    );

    this.userService.createEncadrant(this.newEncadrant)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (encadrant: User) => {
          this.creating = false;
          this.notificationService.success(
            'Encadrant créé avec succès', 
            `${encadrant.prenom} ${encadrant.nom} (${this.newEncadrant.specialite}) a été ajouté au système. Email: ${encadrant.email}`
          );
          this.resetForm();
          this.loadEncadrants();
          this.cdr.detectChanges();
        },
        error: (error: any) => {
          this.creating = false;
          const errorMsg = error.error?.message || 'Erreur lors de la création de l\'encadrant';
          this.notificationService.error('Échec de la création', errorMsg);
          console.error('Erreur création encadrant:', error);
          this.cdr.detectChanges();
        }
      });
  }

  editEncadrant(encadrant: User): void {
    this.notificationService.info(
      'Modification d\'encadrant', 
      `Fonctionnalité de modification pour ${encadrant.nom} ${encadrant.prenom} (${encadrant.specialite}) - En cours de développement`
    );
  }

  deleteEncadrant(id: number): void {
    const encadrant = this.encadrants.find(e => e.id === id);
    const encadrantName = encadrant ? `${encadrant.prenom} ${encadrant.nom}` : 'cet encadrant';
    const specialite = encadrant?.specialite || 'Spécialité inconnue';
    
    this.notificationService.warning(
      'Confirmer la suppression d\'encadrant',
      `⚠️ Attention: Supprimer ${encadrantName} (${specialite}) peut affecter les stages en cours. Cette action est irréversible.`,
      0,
      [
        {
          label: 'Annuler',
          style: 'secondary',
          action: () => {
            this.notificationService.info('Suppression annulée', `Le compte de ${encadrantName} a été conservé`);
          }
        },
        {
          label: 'Supprimer définitivement',
          style: 'danger',
          action: () => {
            this.performDeleteEncadrant(id, encadrantName, specialite);
          }
        }
      ]
    );
  }

  private performDeleteEncadrant(id: number, encadrantName: string, specialite: string): void {
    this.deleting = true;
    this.notificationService.info('Suppression en cours', `Suppression du compte de ${encadrantName}...`);
    
    this.userService.deleteEncadrant(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.deleting = false;
          this.notificationService.success(
            'Encadrant supprimé', 
            `Le compte de ${encadrantName} (${specialite}) a été supprimé du système`
          );
          this.loadEncadrants();
          this.cdr.detectChanges();
        },
        error: (error: any) => {
          this.deleting = false;
          const errorMsg = error.error?.message || 'Erreur lors de la suppression';
          this.notificationService.error(
            'Échec de la suppression', 
            `Impossible de supprimer ${encadrantName}: ${errorMsg}`
          );
          console.error('Erreur suppression encadrant:', error);
          this.cdr.detectChanges();
        }
      });
  }

  private validateEncadrantForm(): boolean {
    const { nom, prenom, email, telephone, specialite, password } = this.newEncadrant;

    if (!nom.trim()) {
      this.notificationService.error('Champ requis', 'Le nom est obligatoire');
      return false;
    }

    if (!prenom.trim()) {
      this.notificationService.error('Champ requis', 'Le prénom est obligatoire');
      return false;
    }

    if (!email.trim()) {
      this.notificationService.error('Champ requis', 'L\'email est obligatoire');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      this.notificationService.error('Email invalide', 'Veuillez saisir une adresse email valide');
      return false;
    }

    if (!telephone.trim()) {
      this.notificationService.error('Champ requis', 'Le numéro de téléphone est obligatoire');
      return false;
    }

    if (!specialite) {
      this.notificationService.error('Spécialité requise', 'Veuillez sélectionner une spécialité');
      return false;
    }

    if (!password || password.length < 6) {
      this.notificationService.error('Mot de passe insuffisant', 'Le mot de passe doit contenir au moins 6 caractères');
      return false;
    }

    return true;
  }

  private resetForm(): void {
    this.newEncadrant = {
      nom: '',
      prenom: '',
      email: '',
      telephone: '',
      specialite: '',
      password: ''
    };
    this.notificationService.info('Formulaire réinitialisé', 'Prêt pour un nouvel encadrant');
  }

  private animateElements(): void {
    const cards = document.querySelectorAll('.management-card');
    cards.forEach((card, index) => {
      setTimeout(() => {
        card.classList.add('animate-slideInFromBottom');
      }, index * 150);
    });
  }

  private getSpecialitesStats(encadrants: User[]): { [key: string]: number } {
    return encadrants.reduce((acc, encadrant) => {
      const spec = encadrant.specialite || 'Non spécifiée';
      acc[spec] = (acc[spec] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });
  }

  // Événements de formulaire avec notifications contextuelles
  onSpecialiteChange(): void {
    if (this.newEncadrant.specialite) {
      this.notificationService.info('Spécialité sélectionnée', `${this.newEncadrant.specialite} - Spécialité confirmée`);
    }
  }

  onFormFieldFocus(fieldName: string): void {
    const helpMessages: { [key: string]: string } = {
      'nom': 'Saisissez le nom de famille de l\'encadrant',
      'prenom': 'Saisissez le prénom de l\'encadrant',
      'email': 'Utilisez une adresse email professionnelle (recommandé: @est.ac.ma)',
      'telephone': 'Format recommandé: +212 6 XX XX XX XX ou 06 XX XX XX XX',
      'specialite': 'Choisissez la spécialité d\'expertise de l\'encadrant',
      'password': 'Minimum 6 caractères - L\'encadrant pourra le modifier après connexion'
    };

    const message = helpMessages[fieldName];
    if (message) {
      this.notificationService.info('Aide', message);
    }
  }

  onEmailBlur(): void {
    if (this.newEncadrant.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (emailRegex.test(this.newEncadrant.email)) {
        this.notificationService.success('Email validé', 'Format d\'email correct');
      } else {
        this.notificationService.error('Email invalide', 'Vérifiez le format de l\'adresse email');
      }
    }
  }

  getEncadrantsBySpecialite(specialite: string): User[] {
    return this.encadrants.filter(e => e.specialite === specialite);
  }

  getTotalBySpecialite(specialite: string): number {
    return this.getEncadrantsBySpecialite(specialite).length;
  }
}
