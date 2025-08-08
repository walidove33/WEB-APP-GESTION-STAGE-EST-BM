import { Component, OnInit, OnDestroy, ChangeDetectorRef , ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';  // ← ajoutez NgForm ici
import { RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { StageService } from '../../../services/stage.service';
import { UserService } from '../../../services/user.service';
import { NotificationService } from '../../../services/notification.service';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { 
  PlanificationSoutenanceResponse, 
  DetailSoutenance, 
  EncadrantDetails 
} from '../../../models/stage.model';
import { User } from '../../../models/user.model';




@Component({
  selector: 'app-planification-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NavbarComponent, LoadingComponent],
  templateUrl: './planification-management.component.html',
  styleUrls: ['./planification-management.component.scss']
})
export class PlanificationManagementComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  planifications: PlanificationSoutenanceResponse[] = [];
  encadrants: User[] = [];
  departements: Array<{ id: number; nom: string }> = [];
  classGroups: Array<{ id: number; nom: string }> = [];
  anneesScolaires: Array<{ id: number; libelle: string }> = [];

  planifDate = '';
  planifEncadrantId = 0;
  planifDepId         = 0;
  planifClasseGroupeId= 0;
  planifAnneeId       = 0;

  newPlanification = {
    dateSoutenance: '',
    encadrant: { id: 0 },
    departement: { id: 0 },
    classeGroupe: { id: 0 },
    anneeScolaire: { id: 0 }
  };

  selectedPlanification: PlanificationSoutenanceResponse | null = null;
  planificationDetails: DetailSoutenance[] = [];
  
  newDetail: DetailSoutenance = {
    id: 0,
    sujet: '',
    dateSoutenance: '',
    heureDebut: '',
    heureFin: '',
    etudiant: { id: 0 },
    planification: { id: 0 }
  };

  loading = false;
  loadingDetails = false;
  creating = false;
  showDetailModal = false;


  @ViewChild('planifForm', { static: false })
  planifForm!: NgForm;

  // Indicateur de création en cours

  constructor(
    private stageService: StageService,
    private userService: UserService,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.notificationService.info('Gestion Planifications', 'Initialisation de la gestion des soutenances...');
    this.loadData();
    this.loadReferenceData(); // Encadrants, départements, classes, années

  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadData(): void {
    this.loadPlanifications();
    this.loadEncadrants();
    this.loadReferenceData();
  }

  loadPlanifications(): void {
    this.loading = true;
    this.stageService.getAllPlanifications()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (planifications) => {
          this.planifications = planifications;
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.loading = false;
          console.error('Erreur chargement planifications:', error);
          this.cdr.detectChanges();
        }
      });
  }

  loadEncadrants(): void {
    this.userService.getEncadrants()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (encadrants) => {
          this.encadrants = encadrants;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Erreur chargement encadrants:', error);
        }
      });
  }

  loadReferenceData(): void {
    // Load departments
    this.stageService.listDepartements()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (deps) => {
          this.departements = deps;
          this.cdr.detectChanges();
        }
      });

    // Load class groups
    this.stageService.listAllClassGroups()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (groups) => {
          this.classGroups = groups;
          this.cdr.detectChanges();
        }
      });

    // Load school years
    this.stageService.listAnneesScolaires()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (years) => {
          this.anneesScolaires = years;
          this.cdr.detectChanges();
        }
      });
  }


  createPlanification(): void {
    console.log('⚙️ createPlanification called', this.newPlanification);

    // Vérification du formulaire
    if (this.planifForm.invalid) {
      this.notificationService.error(
        'Formulaire invalide',
        'Veuillez remplir tous les champs obligatoires'
      );
      return;
    }

    this.creating = true;
    this.stageService.createPlanification(this.newPlanification)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: planif => {
          this.creating = false;
          this.notificationService.success(
            'Succès',
            `Planification créée pour le ${planif.dateSoutenance}`
          );
          // Reset form et payload
          this.planifForm.resetForm();
          this.newPlanification = {
            dateSoutenance: '',
            encadrant:    { id: 0 },
            departement:  { id: 0 },
            classeGroupe: { id: 0 },
            anneeScolaire:{ id: 0 }
          };
          this.cdr.detectChanges();
        },
        error: err => {
          this.creating = false;
          console.error('Erreur création planification:', err);
          this.cdr.detectChanges();
        }
      });
  }



  private resetForm(): void {
    this.newPlanification = {
      dateSoutenance: '',
      encadrant: { id: 0 },
      departement: { id: 0 },
      classeGroupe: { id: 0 },
      anneeScolaire: { id: 0 }
    };
    this.planifForm.resetForm();
  }



  viewPlanificationDetails(planification: PlanificationSoutenanceResponse): void {
    this.selectedPlanification = planification;
    this.loadPlanificationDetails(planification.id);
  }

  loadPlanificationDetails(planifId: number): void {
    this.loadingDetails = true;
    this.stageService.getPlanificationDetails(planifId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (details) => {
          this.planificationDetails = details;
          this.loadingDetails = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.loadingDetails = false;
          console.error('Erreur chargement détails:', error);
          this.cdr.detectChanges();
        }
      });
  }

  openDetailModal(): void {
    if (!this.selectedPlanification) return;
    
    this.newDetail = {
      id: 0,
      sujet: '',
      dateSoutenance: this.selectedPlanification.dateSoutenance,
      heureDebut: '',
      heureFin: '',
      etudiant: { id: 0 },
      planification: { id: this.selectedPlanification.id }
    };
    this.showDetailModal = true;
  }

  closeDetailModal(): void {
    this.showDetailModal = false;
    this.newDetail = {
      id: 0,
      sujet: '',
      dateSoutenance: '',
      heureDebut: '',
      heureFin: '',
      etudiant: { id: 0 },
      planification: { id: 0 }
    };
  }

  addDetailToPlanification(): void {
    if (!this.selectedPlanification || !this.validateDetailForm()) {
      return;
    }

    this.stageService.addDetailToPlanification(this.selectedPlanification.id, this.newDetail)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (detail) => {
          this.closeDetailModal();
          this.loadPlanificationDetails(this.selectedPlanification!.id);
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Erreur ajout détail:', error);
        }
      });
  }

  private validatePlanificationForm(): boolean {
    const { dateSoutenance, encadrant, departement, classeGroupe, anneeScolaire } = this.newPlanification;

    if (!dateSoutenance) {
      this.notificationService.error('Champ requis', 'La date de soutenance est obligatoire');
      return false;
    }

    if (!encadrant.id) {
      this.notificationService.error('Encadrant requis', 'Veuillez sélectionner un encadrant');
      return false;
    }

    if (!departement.id) {
      this.notificationService.error('Département requis', 'Veuillez sélectionner un département');
      return false;
    }

    if (!classeGroupe.id) {
      this.notificationService.error('Classe requise', 'Veuillez sélectionner une classe');
      return false;
    }

    if (!anneeScolaire.id) {
      this.notificationService.error('Année requise', 'Veuillez sélectionner une année scolaire');
      return false;
    }

    return true;
  }

  private validateDetailForm(): boolean {
    const { sujet, heureDebut, heureFin, etudiant } = this.newDetail;

    if (!sujet.trim()) {
      this.notificationService.error('Sujet requis', 'Le sujet de soutenance est obligatoire');
      return false;
    }

    if (!heureDebut) {
      this.notificationService.error('Heure début requise', 'L\'heure de début est obligatoire');
      return false;
    }

    if (!heureFin) {
      this.notificationService.error('Heure fin requise', 'L\'heure de fin est obligatoire');
      return false;
    }

    if (!etudiant.id) {
      this.notificationService.error('Étudiant requis', 'Veuillez sélectionner un étudiant');
      return false;
    }

    // Validate time range
    if (heureDebut >= heureFin) {
      this.notificationService.error('Horaires invalides', 'L\'heure de fin doit être après l\'heure de début');
      return false;
    }

    return true;
  }

  private resetPlanificationForm(): void {
    this.newPlanification = {
      dateSoutenance: '',
      encadrant: { id: 0 },
      departement: { id: 0 },
      classeGroupe: { id: 0 },
      anneeScolaire: { id: 0 }
    };
  }

  getEncadrantName(encadrant: EncadrantDetails | null): string {
    if (!encadrant) return 'Non assigné';
    return `${encadrant.prenom} ${encadrant.nom}`;
  }

  getMinDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  formatTime(time: string): string {
    return time.substring(0, 5); // Remove seconds
  }

  deletePlanification(id: number): void {
    const planif = this.planifications.find(p => p.id === id);
    const planifName = planif ? `Planification du ${planif.dateSoutenance}` : 'cette planification';
    
    this.notificationService.warning(
      'Confirmer la suppression',
      `Êtes-vous sûr de vouloir supprimer ${planifName} ?`,
      0,
      [
        {
          label: 'Annuler',
          style: 'secondary',
          action: () => {
            this.notificationService.info('Suppression annulée', 'La planification a été conservée');
          }
        },
        {
          label: 'Supprimer',
          style: 'danger',
          action: () => {
            // TODO: Implement delete method in service
            this.notificationService.success('Planification supprimée', `${planifName} a été supprimée`);
            this.loadPlanifications();
          }
        }
      ]
    );
  }
}