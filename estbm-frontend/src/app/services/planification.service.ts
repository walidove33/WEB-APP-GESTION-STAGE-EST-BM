import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap, switchMap } from 'rxjs/operators';
import { NotificationService } from './notification.service';
import { 
  PlanificationSoutenanceResponse, 
  DetailSoutenance, 
  SoutenanceEtudiantSlotDto,
  RapportDetails 
} from '../models/stage.model';

@Injectable({
  providedIn: 'root'
})
export class PlanificationService {
  private baseUrl = 'http://localhost:8081/stages/planification';

  constructor(
    private http: HttpClient,
    private notificationService: NotificationService
  ) {}

  // Admin: Get all planifications
  getAll(): Observable<PlanificationSoutenanceResponse[]> {
    const loadingId = this.notificationService.loading(
      'Chargement des planifications...',
      'Récupération de toutes les planifications'
    );

    return this.http.get<PlanificationSoutenanceResponse[]>(this.baseUrl).pipe(
      tap((planifications) => {
        this.notificationService.operationSuccess(
          loadingId,
          'Planifications',
          `${planifications.length} planification(s) chargée(s)`
        );
      }),
      catchError((error) => {
        this.notificationService.operationError(
          loadingId,
          'Planifications',
          'Impossible de charger les planifications'
        );
        return this.handleError(error);
      })
    );
  }

  // Encadrant: Get planifications by supervisor
  getByEncadrant(encadrantId: number): Observable<PlanificationSoutenanceResponse[]> {
    const loadingId = this.notificationService.loading(
      'Chargement de vos planifications...',
      'Récupération des planifications assignées'
    );

    return this.http.get<PlanificationSoutenanceResponse[]>(`${this.baseUrl}/encadrant/${encadrantId}`).pipe(
      tap((planifications) => {
        this.notificationService.operationSuccess(
          loadingId,
          'Mes planifications',
          `${planifications.length} planification(s) trouvée(s)`
        );
      }),
      catchError((error) => {
        this.notificationService.operationError(
          loadingId,
          'Mes planifications',
          'Impossible de charger vos planifications'
        );
        return this.handleError(error);
      })
    );
  }

  // Étudiant: Get student's soutenance slots
  getByEtudiant(etudiantId: number): Observable<SoutenanceEtudiantSlotDto[]> {
    const loadingId = this.notificationService.loading(
      'Chargement de vos créneaux...',
      'Récupération de vos soutenances programmées'
    );

    return this.http.get<SoutenanceEtudiantSlotDto[]>(`${this.baseUrl}/etudiant/${etudiantId}`).pipe(
      tap((soutenances) => {
        this.notificationService.operationSuccess(
          loadingId,
          'Mes soutenances',
          `${soutenances.length} créneau(x) programmé(s)`
        );
      }),
      catchError((error) => {
        this.notificationService.operationError(
          loadingId,
          'Mes soutenances',
          'Impossible de charger vos créneaux'
        );
        return this.handleError(error);
      })
    );
  }

  // Add detail to planification
  addDetail(planifId: number, detail: DetailSoutenance): Observable<DetailSoutenance> {
    const loadingId = this.notificationService.loading(
      'Ajout du créneau...',
      'Enregistrement du nouveau créneau de soutenance'
    );

    return this.http.post<DetailSoutenance>(`${this.baseUrl}/${planifId}/addDetail`, detail).pipe(
      tap((newDetail) => {
        this.notificationService.operationSuccess(
          loadingId,
          'Créneau ajouté',
          `Nouveau créneau créé: ${newDetail.heureDebut} - ${newDetail.heureFin}`
        );
      }),
      catchError((error) => {
        this.notificationService.operationError(
          loadingId,
          'Ajout créneau',
          'Impossible d\'ajouter le créneau'
        );
        return this.handleError(error);
      })
    );
  }

  // Get planification details
  getDetails(planifId: number): Observable<DetailSoutenance[]> {
    const loadingId = this.notificationService.loading(
      'Chargement des créneaux...',
      'Récupération des détails de planification'
    );

    return this.http.get<DetailSoutenance[]>(`${this.baseUrl}/${planifId}/details`).pipe(
      tap((details) => {
        this.notificationService.operationSuccess(
          loadingId,
          'Créneaux',
          `${details.length} créneau(x) trouvé(s)`
        );
      }),
      catchError((error) => {
        this.notificationService.operationError(
          loadingId,
          'Créneaux',
          'Impossible de charger les créneaux'
        );
        return this.handleError(error);
      })
    );
  }

  // Update detail
  updateDetail(detailId: number, detail: DetailSoutenance): Observable<DetailSoutenance> {
    const loadingId = this.notificationService.loading(
      'Mise à jour du créneau...',
      'Sauvegarde des modifications'
    );

    return this.http.put<DetailSoutenance>(`${this.baseUrl}/details/${detailId}`, detail).pipe(
      tap((updatedDetail) => {
        this.notificationService.operationSuccess(
          loadingId,
          'Créneau mis à jour',
          `Créneau modifié: ${updatedDetail.heureDebut} - ${updatedDetail.heureFin}`
        );
      }),
      catchError((error) => {
        this.notificationService.operationError(
          loadingId,
          'Mise à jour',
          'Impossible de mettre à jour le créneau'
        );
        return this.handleError(error);
      })
    );
  }

  // Create new planification (Admin only)
  create(planification: any): Observable<PlanificationSoutenanceResponse> {
    const loadingId = this.notificationService.loading(
      'Création de la planification...',
      'Enregistrement de la nouvelle planification'
    );

    return this.http.post<PlanificationSoutenanceResponse>(this.baseUrl, planification).pipe(
      tap((newPlanification) => {
        this.notificationService.operationSuccess(
          loadingId,
          'Planification créée',
          `Planification du ${newPlanification.dateSoutenance} créée avec succès`
        );
      }),
      catchError((error) => {
        this.notificationService.operationError(
          loadingId,
          'Création planification',
          'Impossible de créer la planification'
        );
        return this.handleError(error);
      })
    );
  }

  // Delete planification (Admin only)
  delete(planifId: number): Observable<void> {
    const loadingId = this.notificationService.loading(
      'Suppression de la planification...',
      'Retrait de la planification du système'
    );

    return this.http.delete<void>(`${this.baseUrl}/${planifId}`).pipe(
      tap(() => {
        this.notificationService.operationSuccess(
          loadingId,
          'Planification supprimée',
          'La planification a été supprimée avec succès'
        );
      }),
      catchError((error) => {
        this.notificationService.operationError(
          loadingId,
          'Suppression',
          'Impossible de supprimer la planification'
        );
        return this.handleError(error);
      })
    );
  }

  // Delete detail
  deleteDetail(detailId: number): Observable<void> {
    const loadingId = this.notificationService.loading(
      'Suppression du créneau...',
      'Retrait du créneau de soutenance'
    );

    return this.http.delete<void>(`${this.baseUrl}/details/${detailId}`).pipe(
      tap(() => {
        this.notificationService.operationSuccess(
          loadingId,
          'Créneau supprimé',
          'Le créneau a été supprimé avec succès'
        );
      }),
      catchError((error) => {
        this.notificationService.operationError(
          loadingId,
          'Suppression créneau',
          'Impossible de supprimer le créneau'
        );
        return this.handleError(error);
      })
    );
  }

  private handleError(error: any): Observable<never> {
    console.error('🚨 PlanificationService error:', error);
    
    let errorMessage = 'Une erreur est survenue';
    
    if (error.status === 401) {
      errorMessage = 'Session expirée. Veuillez vous reconnecter.';
    } else if (error.status === 403) {
      errorMessage = 'Accès refusé.';
    } else if (error.status === 404) {
      errorMessage = 'Planification non trouvée.';
    } else if (error.status === 409) {
      errorMessage = 'Conflit: créneau déjà occupé.';
    } else if (error.status === 0) {
      errorMessage = 'Impossible de se connecter au serveur.';
    } else if (error.error?.message) {
      errorMessage = error.error.message;
    }

    return throwError(() => new Error(errorMessage));
  }
}