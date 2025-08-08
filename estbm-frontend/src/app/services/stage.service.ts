

// import { Injectable } from "@angular/core"
// import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from "@angular/common/http"
// import { Observable, throwError, timer } from "rxjs"
// import { Stage, StageRequest, Rapport, RapportDetails } from "../models/stage.model"
// import { AuthService } from "./auth.service"
// import { NotificationService } from "./notification.service"
// import { environment } from "../environement"
// import { DecisionDto , PlanificationSoutenanceResponse , DetailSoutenance , SoutenanceEtudiantSlotDto} from '../models/stage.model'
// import { of } from 'rxjs'
// import { CommentaireRapport } from "../models/stage.model"
// import { catchError, map, tap, switchMap, finalize } from "rxjs/operators"
// import { GroupAssignmentRequest } from "../models/stage.model"

// @Injectable({
//   providedIn: "root",
// })
// export class StageService {
//   private baseUrl = `${environment.apiUrl}/stages/stages`
//   private adminUrl = "http://localhost:8081/stages/admin"
//   private encadrantUrl = `${environment.apiUrl}/stages/encadrants`
//   private etudUrl = "http://localhost:8081/stages/etudiants"
//   private rapportUrl = "http://localhost:8081/stages/rapports"
//   private planifUrl = `${environment.apiUrl}/stages/planification`;


//   constructor(
//     private http: HttpClient,
//     private authService: AuthService,
//     private notificationService: NotificationService
//   ) {}

//   // ==================== STUDENT METHODS ====================

//   getMyStages(): Observable<Stage[]> {
//     const userEmail = this.authService.getUserEmail()
//     if (!userEmail) {
//       return throwError(() => new Error("User not authenticated"))
//     }

//     console.log("📋 Fetching stages for user email:", userEmail)
    
//     const loadingId = this.notificationService.loading(
//       'Chargement de vos stages...', 
//       'Récupération de votre historique'
//     )

//     return this.http.get<Stage[]>(`${this.etudUrl}/mes-stages`).pipe(
//       // Add delay for better UX
//       switchMap(stages => timer(300).pipe(switchMap(() => [stages]))),
      
//       tap((stages) => {
//         this.notificationService.operationSuccess(
//           loadingId,
//           'Stages',
//           `${stages.length} stage(s) trouvé(s)`
//         )
//       }),
      
//       catchError((error) => {
//         this.notificationService.operationError(
//           loadingId,
//           'Stages',
//           'Impossible de charger vos stages'
//         )
//         return this.handleError(error)
//       })
//     )
//   }

//    createPlanification(planif: {
//     dateSoutenance: string;
//     encadrant: { id: number };
//     departement: { id: number };
//     classeGroupe: { id: number };
//     anneeScolaire: { id: number };
//   }): Observable<PlanificationSoutenanceResponse> {
//     const token = this.authService.getToken();
//     return this.http.post<PlanificationSoutenanceResponse>(
//       this.planifUrl,
//       planif,
//       { headers: new HttpHeaders().set("Authorization", `Bearer ${token}`) }
//     );
//   }


//    getAllPlanifications(): Observable<PlanificationSoutenanceResponse[]> {
//     const token = this.authService.getToken();
//     return this.http.get<PlanificationSoutenanceResponse[]>(
//       this.planifUrl,
//       { headers: new HttpHeaders().set("Authorization", `Bearer ${token}`) }
//     );
//   }

//   /**
//    * ENCADRANT : Récupérer ses planifications
//    */
//   getPlanificationsByEncadrant(encadrantId: number): Observable<PlanificationSoutenanceResponse[]> {
//     const token = this.authService.getToken();
//     return this.http.get<PlanificationSoutenanceResponse[]>(
//       `${this.planifUrl}/encadrant/${encadrantId}`,
//       { headers: new HttpHeaders().set("Authorization", `Bearer ${token}`) }
//     );
//   }

//   /**
//    * ADMIN ou ENCADRANT : Récupérer les détails (slots) d'une planification
//    */
//   getPlanificationDetails(planifId: number): Observable<DetailSoutenance[]> {
//     const token = this.authService.getToken();
//     return this.http.get<DetailSoutenance[]>(
//       `${this.planifUrl}/${planifId}/details`,
//       { headers: new HttpHeaders().set("Authorization", `Bearer ${token}`) }
//     );
//   }


//   addDetailToPlanification(planifId: number, detail: DetailSoutenance): Observable<DetailSoutenance> {
//     const token = this.authService.getToken();
//     return this.http.post<DetailSoutenance>(
//       `${this.planifUrl}/${planifId}/addDetail`,
//       detail,
//       { headers: new HttpHeaders().set("Authorization", `Bearer ${token}`) }
//     );
//   }

//   /**
//    * ETUDIANT : Récupérer ses créneaux de soutenance
//    */
//   getMySoutenances(etudiantId: number): Observable<SoutenanceEtudiantSlotDto[]> {
//     const token = this.authService.getToken();
//     return this.http.get<SoutenanceEtudiantSlotDto[]>(
//       `${this.planifUrl}/etudiant/${etudiantId}`,
//       { headers: new HttpHeaders().set("Authorization", `Bearer ${token}`) }
//     );
//   }

//   createDemande(data: StageRequest): Observable<Stage> {
//     const token = this.authService.getToken()
    
//     const loadingId = this.notificationService.loading(
//       'Création de la demande...', 
//       'Soumission de votre demande de stage'
//     )

//     return this.http.post<Stage>(
//       `${environment.apiUrl}/stages/etudiants/demande`,
//       data,
//       { headers: new HttpHeaders().set('Authorization', `Bearer ${token}`) }
//     ).pipe(
//       // Add delay for better UX
//       switchMap(stage => timer(800).pipe(switchMap(() => [stage]))),
      
//       tap((stage) => {
//         this.notificationService.operationSuccess(
//           loadingId,
//           'Demande de stage',
//           `Demande créée avec succès pour ${stage.entreprise}`
//         )
//       }),
      
//       catchError((error) => {
//         let errorMessage = 'Impossible de créer la demande'
//         if (error.status === 400) {
//           errorMessage = 'Données de la demande invalides'
//         } else if (error.status === 409) {
//           errorMessage = 'Vous avez déjà une demande en cours'
//         }
        
//         this.notificationService.operationError(
//           loadingId,
//           'Demande de stage',
//           errorMessage
//         )
//         return this.handleError(error)
//       })
//     )
//   }

//   submitRapport(stageId: number, file: File): Observable<any> {
//     const formData = new FormData()
//     formData.append('file', file)

//     const token = this.authService.getToken()
//     const headers = new HttpHeaders({
//       'Authorization': `Bearer ${token}`
//     })

//     const loadingId = this.notificationService.loading(
//       'Soumission du rapport...', 
//       `Upload de ${file.name} en cours`
//     )

//     return this.http.post(`${this.rapportUrl}/${stageId}`, formData, { headers }).pipe(
//       // Add delay for upload simulation
//       switchMap(response => timer(1200).pipe(switchMap(() => [response]))),
      
//       tap(() => {
//         this.notificationService.operationSuccess(
//           loadingId,
//           'Rapport',
//           'Votre rapport a été soumis avec succès et sera examiné par votre encadrant'
//         )
//       }),
      
//       catchError((error) => {
//         let errorMessage = 'Impossible de soumettre le rapport'
//         if (error.status === 413) {
//           errorMessage = 'Fichier trop volumineux (max 10MB)'
//         } else if (error.status === 415) {
//           errorMessage = 'Format de fichier non supporté (PDF uniquement)'
//         }
        
//         this.notificationService.operationError(
//           loadingId,
//           'Rapport',
//           errorMessage
//         )
//         return throwError(() => error)
//       })
//     )
//   }

//   downloadConvention(stageId: number): Observable<Blob> {
//     const params = new HttpParams().set("idStage", stageId.toString())
    
//     const loadingId = this.notificationService.loading(
//       'Génération de la convention...', 
//       'Préparation du document PDF'
//     )

//     return this.http.get(`${this.baseUrl}/convention`, {
//       params,
//       responseType: "blob",
//     }).pipe(
//       tap(() => {
//         this.notificationService.operationSuccess(
//           loadingId,
//           'Convention',
//           'Document téléchargé avec succès'
//         )
//       }),
      
//       catchError((error) => {
//         this.notificationService.operationError(
//           loadingId,
//           'Convention',
//           'Impossible de générer la convention'
//         )
//         return this.handleError(error)
//       })
//     )
//   }

//   downloadAssurance(stageId: number): Observable<Blob> {
//     const loadingId = this.notificationService.loading(
//       'Téléchargement de l\'assurance...', 
//       'Récupération du document'
//     )

//     return this.http.get(`${this.baseUrl}/${stageId}/documents`, {
//       responseType: "blob",
//     }).pipe(
//       tap(() => {
//         this.notificationService.operationSuccess(
//           loadingId,
//           'Assurance',
//           'Attestation téléchargée avec succès'
//         )
//       }),
      
//       catchError((error) => {
//         this.notificationService.operationError(
//           loadingId,
//           'Assurance',
//           'Impossible de télécharger l\'attestation'
//         )
//         return this.handleError(error)
//       })
//     )
//   }

//   // ==================== ENCADRANT METHODS ====================

//   getMyAssignedStages(): Observable<Stage[]> {
//     const loadingId = this.notificationService.loading(
//       'Chargement de vos stages...', 
//       'Récupération des stages assignés'
//     )

//     return this.http.get<Stage[]>(`${this.encadrantUrl}/me/stages`).pipe(
//       switchMap(stages => timer(400).pipe(switchMap(() => [stages]))),
      
//       tap((stages) => {
//         this.notificationService.operationSuccess(
//           loadingId,
//           'Stages assignés',
//           `${stages.length} stage(s) sous votre supervision`
//         )
//       }),
      
//       catchError((error) => {
//         this.notificationService.operationError(
//           loadingId,
//           'Stages assignés',
//           'Impossible de charger vos stages'
//         )
//         return this.handleError(error)
//       })
//     )
//   }

//   approveDecision(dto: DecisionDto): Observable<{ message: string }> {
//     const loadingId = this.notificationService.loading(
//       'Traitement de la décision...', 
//       dto.approuver ? 'Approbation en cours' : 'Rejet en cours'
//     )

//     return this.http.post<{ message: string }>(
//       `${this.encadrantUrl}/decision`, 
//       dto
//     ).pipe(
//       switchMap(response => timer(600).pipe(switchMap(() => [response]))),
      
//       tap((response) => {
//         const action = dto.approuver ? 'approuvée' : 'rejetée'
//         this.notificationService.operationSuccess(
//           loadingId,
//           'Décision',
//           `Demande ${action} avec succès`
//         )
//       }),
      
//       catchError((error) => {
//         this.notificationService.operationError(
//           loadingId,
//           'Décision',
//           'Impossible de traiter la décision'
//         )
//         return this.handleError(error)
//       })
//     )
//   }

//   rejectStage(stageId: number, commentaire: string): Observable<string> {
//     const userId = this.authService.getUserId()
//     if (!userId) return throwError(() => new Error("User not authenticated"))
    
//     const loadingId = this.notificationService.loading(
//       'Rejet du stage...', 
//       'Enregistrement du commentaire'
//     )

//     return this.http.put(
//       `${this.encadrantUrl}/${userId}/stage/${stageId}/refuser`, 
//       { commentaire },
//       { 
//         responseType: 'text',
//         headers: new HttpHeaders().set('Content-Type', 'text/plain')
//       }
//     ).pipe(
//       switchMap(response => timer(500).pipe(switchMap(() => [response]))),
      
//       tap(() => {
//         this.notificationService.operationSuccess(
//           loadingId,
//           'Stage rejeté',
//           'Le stage a été rejeté avec commentaire'
//         )
//       }),
      
//       catchError((error) => {
//         this.notificationService.operationError(
//           loadingId,
//           'Rejet du stage',
//           'Impossible de rejeter le stage'
//         )
//         return this.handleError(error)
//       })
//     )
//   }

//   getRapportsForEncadrant(): Observable<RapportDetails[]> {
//     const loadingId = this.notificationService.loading(
//       'Chargement des rapports...', 
//       'Récupération des rapports soumis'
//     )

//     return this.http.get<RapportDetails[]>(`${this.encadrantUrl}/me/rapports/details`).pipe(
//       switchMap(rapports => timer(400).pipe(switchMap(() => [rapports]))),
      
//       tap((rapports) => {
//         this.notificationService.operationSuccess(
//           loadingId,
//           'Rapports',
//           `${rapports.length} rapport(s) trouvé(s)`
//         )
//       }),
      
//       catchError((error) => {
//         this.notificationService.operationError(
//           loadingId,
//           'Rapports',
//           'Impossible de charger les rapports'
//         )
//         return this.handleError(error)
//       })
//     )
//   }

//   validateRapport(rapportId: number, commentaire?: string): Observable<Rapport> {
//     const loadingId = this.notificationService.loading(
//       'Validation du rapport...', 
//       'Enregistrement de votre validation'
//     )

//     return this.http.put<Rapport>(`${this.encadrantUrl}/rapports/${rapportId}/validate`, {
//       commentaire: commentaire || "",
//     }).pipe(
//       switchMap(rapport => timer(600).pipe(switchMap(() => [rapport]))),
      
//       tap(() => {
//         this.notificationService.operationSuccess(
//           loadingId,
//           'Rapport validé',
//           'Le rapport a été validé avec succès'
//         )
//       }),
      
//       catchError((error) => {
//         this.notificationService.operationError(
//           loadingId,
//           'Validation',
//           'Impossible de valider le rapport'
//         )
//         return this.handleError(error)
//       })
//     )
//   }

//   rejectRapport(rapportId: number, commentaire: string): Observable<Rapport> {
//     const loadingId = this.notificationService.loading(
//       'Rejet du rapport...', 
//       'Enregistrement de votre commentaire'
//     )

//     return this.http.put<Rapport>(`${this.encadrantUrl}/rapports/${rapportId}/reject`, {
//       commentaire,
//     }).pipe(
//       switchMap(rapport => timer(500).pipe(switchMap(() => [rapport]))),
      
//       tap(() => {
//         this.notificationService.operationSuccess(
//           loadingId,
//           'Rapport rejeté',
//           'Le rapport a été rejeté avec commentaire'
//         )
//       }),
      
//       catchError((error) => {
//         this.notificationService.operationError(
//           loadingId,
//           'Rejet',
//           'Impossible de rejeter le rapport'
//         )
//         return this.handleError(error)
//       })
//     )
//   }

//   // ==================== ADMIN METHODS ====================

//   getAllStages(): Observable<Stage[]> {
//     const loadingId = this.notificationService.loading(
//       'Chargement de tous les stages...', 
//       'Récupération des données administratives'
//     )

//     return this.http.get<Stage[]>(`${this.adminUrl}/stages`).pipe(
//       switchMap(stages => timer(500).pipe(switchMap(() => [stages]))),
      
//       tap((stages) => {
//         this.notificationService.operationSuccess(
//           loadingId,
//           'Stages',
//           `${stages.length} stage(s) dans le système`
//         )
//       }),
      
//       catchError((error) => {
//         this.notificationService.operationError(
//           loadingId,
//           'Stages',
//           'Impossible de charger les stages'
//         )
//         return this.handleError(error)
//       })
//     )
//   }

//   getStageStats(): Observable<any> {
//     const loadingId = this.notificationService.loading(
//       'Calcul des statistiques...', 
//       'Analyse des données'
//     )

//     return this.http.get<any>(`${this.adminUrl}/statistiques`).pipe(
//       switchMap(stats => timer(600).pipe(switchMap(() => [stats]))),
      
//       map(stats => ({
//         total: stats.total || 0,
//         enAttente: stats.enAttente || 0,
//         valides: stats.valides || 0,
//         refuses: stats.refuses || 0,
//         enCours: stats.enCours || 0,
//         totalEtudiants: stats.totalEtudiants || 0,
//         totalEncadrants: stats.totalEncadrants || 0
//       })),
      
//       tap((stats) => {
//         this.notificationService.operationSuccess(
//           loadingId,
//           'Statistiques',
//           `Données analysées: ${stats.total} stages, ${stats.totalEtudiants} étudiants`
//         )
//       }),
      
//       catchError((error) => {
//         this.notificationService.operationError(
//           loadingId,
//           'Statistiques',
//           'Impossible de calculer les statistiques'
//         )
//         return this.handleError(error)
//       })
//     )
//   }

//   assignerEncadrantGroupe(dto: GroupAssignmentRequest): Observable<{ message: string }> {
//     const loadingId = this.notificationService.loading(
//       'Affectation par groupe...', 
//       'Attribution de l\'encadrant aux étudiants'
//     )

//     return this.http.post<{ message: string }>(
//       `${this.adminUrl}/assigner-encadrant-groupe`,
//       dto
//     ).pipe(
//       switchMap(response => timer(1000).pipe(switchMap(() => [response]))),
      
//       tap((response) => {
//         this.notificationService.operationSuccess(
//           loadingId,
//           'Affectation réussie',
//           response.message || 'Encadrant affecté au groupe avec succès'
//         )
//       }),
      
//       catchError((error) => {
//         let errorMessage = 'Impossible d\'affecter l\'encadrant'
//         if (error.status === 404) {
//           errorMessage = 'Encadrant ou groupe non trouvé'
//         } else if (error.status === 409) {
//           errorMessage = 'Conflit d\'affectation détecté'
//         }
        
//         this.notificationService.operationError(
//           loadingId,
//           'Affectation',
//           errorMessage
//         )
//         return this.handleError(error)
//       })
//     )
//   }

//   // ==================== ENHANCED METHODS WITH ANIMATIONS ====================

//   downloadRapport(stageId: number): Observable<HttpResponse<Blob>> {
//     const loadingId = this.notificationService.loading(
//       'Téléchargement du rapport...', 
//       'Préparation du fichier PDF'
//     )

//     return this.http.get(
//       `${this.rapportUrl}/${stageId}/download`,
//       { 
//         responseType: 'blob',
//         withCredentials: true,
//         observe: 'response'
//       }
//     ).pipe(
//       tap(() => {
//         this.notificationService.operationSuccess(
//           loadingId,
//           'Téléchargement',
//           'Rapport téléchargé avec succès'
//         )
//       }),
      
//       catchError((error) => {
//         this.notificationService.operationError(
//           loadingId,
//           'Téléchargement',
//           'Impossible de télécharger le rapport'
//         )
//         return throwError(() => error)
//       })
//     )
//   }

//   getMesDemandes(): Observable<Stage[]> {
//     const loadingId = this.notificationService.loading(
//       'Chargement des demandes...', 
//       'Récupération des demandes en attente'
//     )

//     return this.http.get<Stage[]>(`${this.encadrantUrl}/me/demandes`).pipe(
//       switchMap(demandes => timer(300).pipe(switchMap(() => [demandes]))),
      
//       tap((demandes) => {
//         this.notificationService.operationSuccess(
//           loadingId,
//           'Demandes',
//           `${demandes.length} demande(s) en attente de validation`
//         )
//       }),
      
//       catchError((error) => {
//         this.notificationService.operationError(
//           loadingId,
//           'Demandes',
//           'Impossible de charger les demandes'
//         )
//         return this.handleError(error)
//       })
//     )
//   }

//   getExistingRapport(stageId: number): Observable<Rapport | null> {
//     const token = this.authService.getToken()
//     const headers = new HttpHeaders({
//       'Authorization': `Bearer ${token}`
//     })

//     return this.http.get<Rapport | null>(
//       `${environment.apiUrl}/stages/etudiants/rapport/${stageId}`,
//       { headers }
//     ).pipe(
//       catchError(() => of(null))
//     )
//   }

//   // ==================== REFERENCE DATA METHODS ====================

//   listDepartements(): Observable<{id: number, nom: string}[]> {
//     const loadingId = this.notificationService.loading(
//       'Chargement des départements...', 
//       'Récupération de la liste'
//     )

//     return this.http.get<{id: number, nom: string}[]>(`${this.adminUrl}/departements`).pipe(
//       tap((deps) => {
//         this.notificationService.operationSuccess(
//           loadingId,
//           'Départements',
//           `${deps.length} département(s) disponible(s)`
//         )
//       }),
      
//       catchError((error) => {
//         this.notificationService.operationError(
//           loadingId,
//           'Départements',
//           'Impossible de charger les départements'
//         )
//         return this.handleError(error)
//       })
//     )
//   }

//   listClassGroups(depId: number): Observable<{id: number, nom: string}[]> {
//     const loadingId = this.notificationService.loading(
//       'Chargement des groupes...', 
//       'Récupération des classes'
//     )

//     return this.http.get<{id: number, nom: string}[]>(
//       `${this.adminUrl}/departements/${depId}/class-groups`
//     ).pipe(
//       tap((groups) => {
//         this.notificationService.operationSuccess(
//           loadingId,
//           'Groupes',
//           `${groups.length} groupe(s) trouvé(s)`
//         )
//       }),
      
//       catchError((error) => {
//         this.notificationService.operationError(
//           loadingId,
//           'Groupes',
//           'Impossible de charger les groupes'
//         )
//         return this.handleError(error)
//       })
//     )
//   }

//   listAnneesScolaires(): Observable<{id: number, libelle: string}[]> {
//     const loadingId = this.notificationService.loading(
//       'Chargement des années scolaires...', 
//       'Récupération des données'
//     )

//     return this.http.get<{id: number, libelle: string}[]>(
//       `${this.adminUrl}/annee-scolaires`
//     ).pipe(
//       tap((years) => {
//         this.notificationService.operationSuccess(
//           loadingId,
//           'Années scolaires',
//           `${years.length} année(s) disponible(s)`
//         )
//       }),
      
//       catchError((error) => {
//         this.notificationService.operationError(
//           loadingId,
//           'Années scolaires',
//           'Impossible de charger les années'
//         )
//         return this.handleError(error)
//       })
//     )
//   }

//   listAllClassGroups(): Observable<{id: number, nom: string}[]> {
//     const loadingId = this.notificationService.loading(
//       'Chargement de tous les groupes...', 
//       'Récupération complète'
//     )

//     return this.http.get<{id: number, nom: string}[]>(
//       `${this.adminUrl}/class-groups`
//     ).pipe(
//       tap((groups) => {
//         this.notificationService.operationSuccess(
//           loadingId,
//           'Tous les groupes',
//           `${groups.length} groupe(s) dans le système`
//         )
//       }),
      
//       catchError((error) => {
//         this.notificationService.operationError(
//           loadingId,
//           'Groupes',
//           'Impossible de charger tous les groupes'
//         )
//         return this.handleError(error)
//       })
//     )
//   }

//   // ==================== COMMENT METHODS ====================

//   listCommentaires(etudiantFilter?: string): Observable<CommentaireRapport[]> {
//     let params = etudiantFilter
//       ? new HttpParams().set('etudiant', etudiantFilter)
//       : undefined

//     const loadingId = this.notificationService.loading(
//       'Chargement des commentaires...', 
//       'Récupération de l\'historique'
//     )

//     return this.http.get<CommentaireRapport[]>(
//       `${this.encadrantUrl}/me/commentaires`,
//       { params }
//     ).pipe(
//       tap((comments) => {
//         this.notificationService.operationSuccess(
//           loadingId,
//           'Commentaires',
//           `${comments.length} commentaire(s) trouvé(s)`
//         )
//       }),
      
//       catchError((error) => {
//         this.notificationService.operationError(
//           loadingId,
//           'Commentaires',
//           'Impossible de charger les commentaires'
//         )
//         return this.handleError(error)
//       })
//     )
//   }

//   addComment(rapportId: number, texte: string): Observable<CommentaireRapport> {
//     const token = this.authService.getToken()
//     const headers = new HttpHeaders({
//       'Authorization': `Bearer ${token}`,
//       'Content-Type': 'application/json'
//     })

//     const loadingId = this.notificationService.loading(
//       'Ajout du commentaire...', 
//       'Enregistrement en cours'
//     )

//     return this.http.post<CommentaireRapport>(
//       `${this.encadrantUrl}/${rapportId}/commentaire`,
//       { texte },
//       { headers }
//     ).pipe(
//       switchMap(comment => timer(400).pipe(switchMap(() => [comment]))),
      
//       tap(() => {
//         this.notificationService.operationSuccess(
//           loadingId,
//           'Commentaire ajouté',
//           'Votre commentaire a été enregistré'
//         )
//       }),
      
//       catchError((error) => {
//         this.notificationService.operationError(
//           loadingId,
//           'Commentaire',
//           'Impossible d\'ajouter le commentaire'
//         )
//         return this.handleError(error)
//       })
//     )
//   }

//   // ==================== UTILITY METHODS ====================

//   getAssignments(): Observable<any[]> {
//     const loadingId = this.notificationService.loading(
//       'Chargement des affectations...', 
//       'Récupération des associations'
//     )

//     return this.http.get<any[]>(`${this.adminUrl}/assignments`).pipe(
//       tap((assignments) => {
//         this.notificationService.operationSuccess(
//           loadingId,
//           'Affectations',
//           `${assignments.length} affectation(s) trouvée(s)`
//         )
//       }),
      
//       catchError(() => {
//         this.notificationService.remove(loadingId)
//         return of([])
//       })
//     )
//   }

//   removeAssignment(assignmentId: number): Observable<void> {
//     const loadingId = this.notificationService.loading(
//       'Suppression de l\'affectation...', 
//       'Retrait de l\'association'
//     )

//     return this.http.delete<void>(`${this.adminUrl}/assignments/${assignmentId}`).pipe(
//       switchMap(response => timer(400).pipe(switchMap(() => [response]))),
      
//       tap(() => {
//         this.notificationService.operationSuccess(
//           loadingId,
//           'Affectation supprimée',
//           'L\'association a été retirée avec succès'
//         )
//       }),
      
//       catchError((error) => {
//         this.notificationService.operationError(
//           loadingId,
//           'Suppression',
//           'Impossible de supprimer l\'affectation'
//         )
//         return this.handleError(error)
//       })
//     )
//   }

//   // ==================== BATCH OPERATIONS ====================

//   batchApproveStages(stageIds: number[]): Observable<any> {
//     const operations = stageIds.map(id => `Approbation stage #${id}`)
    
//     this.notificationService.batchOperation(operations, () => {
//       this.notificationService.successWithBounce(
//         'Approbations terminées',
//         `${stageIds.length} stages approuvés avec succès`
//       )
//     })

//     // Simulate batch processing
//     return timer(2000).pipe(
//       map(() => ({ success: true, count: stageIds.length }))
//     )
//   }

//   batchRejectStages(stageIds: number[], reason: string): Observable<any> {
//     const operations = stageIds.map(id => `Rejet stage #${id}`)
    
//     this.notificationService.batchOperation(operations, () => {
//       this.notificationService.successWithBounce(
//         'Rejets terminés',
//         `${stageIds.length} stages rejetés avec motif: ${reason}`
//       )
//     })

//     return timer(2000).pipe(
//       map(() => ({ success: true, count: stageIds.length }))
//     )
//   }

//   // ==================== PERFORMANCE OPTIMIZED METHODS ====================

//   // Cached methods for better performance
//   private departementCache: {id: number, nom: string}[] | null = null
//   private cacheTimestamp: number = 0
//   private cacheTimeout = 5 * 60 * 1000 // 5 minutes

//   listDepartementsOptimized(): Observable<{id: number, nom: string}[]> {
//     const now = Date.now()
    
//     // Return cached data if available and fresh
//     if (this.departementCache && (now - this.cacheTimestamp) < this.cacheTimeout) {
//       return of(this.departementCache)
//     }

//     return this.listDepartements().pipe(
//       tap((deps) => {
//         this.departementCache = deps
//         this.cacheTimestamp = now
//       })
//     )
//   }

//   // Clear cache when needed
//   clearCache(): void {
//     this.departementCache = null
//     this.cacheTimestamp = 0
//     this.notificationService.info('Cache vidé', 'Données actualisées')
//   }

//   // ==================== ERROR HANDLING ====================

//   private handleError = (error: any): Observable<never> => {
//     console.error("🚨 StageService error:", error)
    
//     let errorMessage = "Une erreur est survenue"

//     if (error.status === 401) {
//       errorMessage = "Session expirée. Veuillez vous reconnecter."
//       // Auto logout on 401
//       setTimeout(() => this.authService.logout(), 1000)
//     } else if (error.status === 403) {
//       errorMessage = "Accès refusé."
//     } else if (error.status === 404) {
//       errorMessage = "Ressource non trouvée."
//     } else if (error.status === 0) {
//       errorMessage = "Impossible de se connecter au serveur."
//     } else if (error.error?.message) {
//       errorMessage = error.error.message
//     }

//     return throwError(() => new Error(errorMessage))
//   }

//   // ==================== ADDITIONAL UTILITY METHODS ====================

//   getMyStageStatus(): Observable<string> {
//     return this.http.get<string>(`${this.baseUrl}/etat/mes-demandes`).pipe(
//       catchError(this.handleError)
//     )
//   }

//   getRapportUrl(stageId: number): Observable<string> {
//     const token = this.authService.getToken()
//     const headers = new HttpHeaders({
//       'Authorization': `Bearer ${token}`
//     })

//     return this.http.get(`${this.encadrantUrl}/${stageId}/url`, { 
//       headers, 
//       responseType: 'text' 
//     })
//   }

//   getRapportsByStage(stageId: number): Observable<Rapport[]> {
//     return this.http.get<Rapport[]>(`${this.rapportUrl}/stage/${stageId}`).pipe(
//       catchError(this.handleError)
//     )
//   }

//   addNote(stageId: number, note: string): Observable<any> {
//     const userId = this.getCurrentUserId()
//     if (!userId) {
//       return throwError(() => new Error("User not authenticated"))
//     }

//     const loadingId = this.notificationService.loading(
//       'Ajout de la note...', 
//       'Enregistrement du commentaire'
//     )

//     return this.http.put(
//       `${this.encadrantUrl}/${userId}/stage/${stageId}/note`,
//       {},
//       {
//         params: new HttpParams().set("commentaire", note),
//       },
//     ).pipe(
//       tap(() => {
//         this.notificationService.operationSuccess(
//           loadingId,
//           'Note ajoutée',
//           'Votre commentaire a été enregistré'
//         )
//       }),
      
//       catchError((error) => {
//         this.notificationService.operationError(
//           loadingId,
//           'Note',
//           'Impossible d\'ajouter la note'
//         )
//         return this.handleError(error)
//       })
//     )
//   }

//   uploadStageDocuments(stageId: number, assurance: File, convention: File): Observable<any> {
//     const formData = new FormData()
//     formData.append("files", assurance)
//     formData.append("files", convention)
//     formData.append("types", "ASSURANCE")
//     formData.append("types", "CONVENTION")

//     const loadingId = this.notificationService.loading(
//       'Upload des documents...', 
//       'Téléversement en cours'
//     )

//     return this.http.put(`${this.adminUrl}/${stageId}/documents`, formData).pipe(
//       switchMap(response => timer(800).pipe(switchMap(() => [response]))),
      
//       tap(() => {
//         this.notificationService.operationSuccess(
//           loadingId,
//           'Documents',
//           'Documents téléversés avec succès'
//         )
//       }),
      
//       catchError((error) => {
//         this.notificationService.operationError(
//           loadingId,
//           'Documents',
//           'Impossible de téléverser les documents'
//         )
//         return this.handleError(error)
//       })
//     )
//   }

//   // Pagination support
//   getPaginatedStages(page: number, size: number): Observable<any> {
//     const params = new HttpParams()
//       .set('page', page.toString())
//       .set('size', size.toString())
        
//     const loadingId = this.notificationService.loading(
//       `Chargement page ${page + 1}...`, 
//       'Récupération des données'
//     )

//     return this.http.get<any>(`${this.adminUrl}/stages`, { params }).pipe(
//       tap((data) => {
//         this.notificationService.operationSuccess(
//           loadingId,
//           'Pagination',
//           `Page ${page + 1} chargée (${data.content?.length || 0} éléments)`
//         )
//       }),
      
//       catchError((error) => {
//         this.notificationService.operationError(
//           loadingId,
//           'Pagination',
//           'Impossible de charger la page'
//         )
//         return throwError(() => error)
//       })
//     )
//   }

//   private getCurrentUserId(): number | null {
//     return this.authService.getUserId()
//   }

//   // Additional methods for completeness
//   getStagesDtoParEtudiant(idEtudiant: number): Observable<any[]> {
//     return this.http.get<any[]>(`${this.baseUrl}/etudiant/${idEtudiant}/dto`).pipe(
//       catchError(this.handleError)
//     )
//   }

//   getStagesDtoParEncadrant(idEncadrant: number): Observable<any[]> {
//     return this.http.get<any[]>(`${this.baseUrl}/encadrant/${idEncadrant}/dto`).pipe(
//       catchError(this.handleError)
//     )
//   }

//   getRapportEntityByStage(idStage: number): Observable<Rapport> {
//     return this.http.get<Rapport>(`${this.rapportUrl}/stage/${idStage}/entity`).pipe(
//       catchError(this.handleError)
//     )
//   }

//   getRapportUrlByStage(stageId: number): Observable<string | null> {
//     return this.http.get(`${this.rapportUrl}/${stageId}/url`, { responseType: 'text' }).pipe(
//       catchError(() => of(null))
//     )
//   }

//   getDemandesParEncadrant(idEncadrant: number): Observable<Stage[]> {
//     return this.http.get<Stage[]>(`${this.encadrantUrl}/${idEncadrant}/demandes`).pipe(
//       catchError(this.handleError)
//     )
//   }

//   getExistingRapportDto(stageId: number): Observable<any> {
//     return this.http.get<any>(`${this.rapportUrl}/stage/${stageId}/dto`).pipe(
//       catchError(() => of(null))
//     )
//   }
// }


import { Injectable } from "@angular/core"
import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from "@angular/common/http"
import { Observable, throwError, timer } from "rxjs"
import { Stage, StageRequest, Rapport, RapportDetails, PlanificationSoutenanceResponse, DetailSoutenance, SoutenanceEtudiantSlotDto } from "../models/stage.model"
import { AuthService } from "./auth.service"
import { NotificationService } from "./notification.service"
import { environment } from "../environement"
import { DecisionDto } from '../models/stage.model'
import { of } from 'rxjs'
import { CommentaireRapport } from "../models/stage.model"
import { catchError, map, tap, switchMap, finalize } from "rxjs/operators"
import { GroupAssignmentRequest } from "../models/stage.model"



@Injectable({
  providedIn: "root",
})
export class StageService {
  private baseUrl = `${environment.apiUrl}/stages/stages`
  private adminUrl = "http://localhost:8081/stages/admin";
  private encadrantUrl = `${environment.apiUrl}/stages/encadrants`
  private etudUrl = "http://localhost:8081/stages/etudiants"
  private rapportUrl = "http://localhost:8081/stages/rapports"
  private planifUrl = "http://localhost:8081/stages/planification"

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}

  // ==================== SOUTENANCE METHODS ====================

 createPlanification(planif: {
    dateSoutenance: string;
    encadrant: { id: number };
    departement: { id: number };
    classeGroupe: { id: number };
    anneeScolaire: { id: number };
  }): Observable<PlanificationSoutenanceResponse> {
    // Aplatir l'objet pour correspondre à PlanificationRequest côté Java
    const payload = {
      dateSoutenance:  planif.dateSoutenance,
      encadrantId:     planif.encadrant.id,
      departementId:   planif.departement.id,
      classeGroupeId:  planif.classeGroupe.id,
      anneeScolaireId: planif.anneeScolaire.id
    };


        // Récupérer le token pour l'autorisation
    const token = this.authService.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

  const loadingId = this.notificationService.loading(
    'Création de la planification...', 
    'Configuration des soutenances'
  );

   return this.http.post<PlanificationSoutenanceResponse>(
      `${this.planifUrl}/create`,
      payload,
      { headers }
    ).pipe(
      switchMap(response => timer(600).pipe(switchMap(() => [response]))),
      tap(response => {
        this.notificationService.operationSuccess(
          loadingId,
          'Planification créée',
          `Planification pour le ${response.dateSoutenance} créée avec succès`
        );
      }),
      
      catchError((error) => {
        this.notificationService.operationError(
          loadingId,
          'Planification',
          'Impossible de créer la planification'
        )
        return this.handleError(error)
      })
    )
  }

  getAllPlanifications(): Observable<PlanificationSoutenanceResponse[]> {
  const loadingId = this.notificationService.loading(
    'Chargement des planifications...', 
    'Récupération de toutes les planifications'
  )

 return this.http.get<PlanificationSoutenanceResponse[]>(
    `${this.planifUrl}/all`).pipe(
    switchMap(planifs => timer(400).pipe(switchMap(() => [planifs]))),
    tap((planifs) => {
      this.notificationService.operationSuccess(
        loadingId,
        'Planifications',
        `${planifs.length} planification(s) trouvée(s)`
      )
    }),
    catchError((error) => {
      this.notificationService.operationError(
        loadingId,
        'Planifications',
        'Impossible de charger les planifications'
      )
      return this.handleError(error)
    })
  )
}



updateSoutenanceDetail(detailId: number, detail: DetailSoutenance): Observable<DetailSoutenance> {
  const loadingId = this.notificationService.loading(
    'Mise à jour du créneau...', 
    'Modification du créneau de soutenance'
  )

  return this.http.put<DetailSoutenance>(
    `${this.planifUrl}/details/${detailId}`,
    detail
  ).pipe(
    switchMap(updatedDetail => timer(500).pipe(switchMap(() => [updatedDetail]))),
    tap(() => {
      this.notificationService.operationSuccess(
        loadingId,
        'Créneau mis à jour',
        'Les modifications ont été enregistrées'
      )
    }),
    catchError((error) => {
      this.notificationService.operationError(
        loadingId,
        'Mise à jour',
        'Impossible de modifier le créneau'
      )
      return this.handleError(error)
    })
  )
}

  getPlanificationsByEncadrant(encadrantId: number): Observable<PlanificationSoutenanceResponse[]> {
    const loadingId = this.notificationService.loading(
      'Chargement de vos planifications...', 
      'Récupération des planifications assignées'
    )

    return this.http.get<PlanificationSoutenanceResponse[]>(
      `${this.planifUrl}/encadrant/${encadrantId}`
    ).pipe(
      switchMap(planifs => timer(400).pipe(switchMap(() => [planifs]))),
      
      tap((planifs) => {
        this.notificationService.operationSuccess(
          loadingId,
          'Vos planifications',
          `${planifs.length} planification(s) assignée(s)`
        )
      }),
      
      catchError((error) => {
        this.notificationService.operationError(
          loadingId,
          'Planifications',
          'Impossible de charger vos planifications'
        )
        return this.handleError(error)
      })
    )
  }

  getPlanificationDetails(planifId: number): Observable<DetailSoutenance[]> {
    const loadingId = this.notificationService.loading(
      'Chargement des détails...', 
      'Récupération des créneaux de soutenance'
    )

    return this.http.get<DetailSoutenance[]>(
      `${this.planifUrl}/${planifId}/details`
    ).pipe(
      switchMap(details => timer(300).pipe(switchMap(() => [details]))),
      
      tap((details) => {
        this.notificationService.operationSuccess(
          loadingId,
          'Détails de planification',
          `${details.length} créneau(x) trouvé(s)`
        )
      }),
      
      catchError((error) => {
        this.notificationService.operationError(
          loadingId,
          'Détails',
          'Impossible de charger les détails'
        )
        return this.handleError(error)
      })
    )
  }

  addDetailToPlanification(planifId: number, detail: DetailSoutenance): Observable<DetailSoutenance> {
    const loadingId = this.notificationService.loading(
      'Ajout du créneau...', 
      'Création du nouveau créneau de soutenance'
    )

    return this.http.post<DetailSoutenance>(
      `${this.planifUrl}/${planifId}/addDetail`,
      detail
    ).pipe(
      switchMap(newDetail => timer(500).pipe(switchMap(() => [newDetail]))),
      
      tap((newDetail) => {
        this.notificationService.operationSuccess(
          loadingId,
          'Créneau ajouté',
          `Créneau de ${newDetail.heureDebut} à ${newDetail.heureFin} créé`
        )
      }),
      
      catchError((error) => {
        this.notificationService.operationError(
          loadingId,
          'Ajout créneau',
          'Impossible d\'ajouter le créneau'
        )
        return this.handleError(error)
      })
    )
  }

  getMySoutenances(etudiantId: number): Observable<SoutenanceEtudiantSlotDto[]> {
    const loadingId = this.notificationService.loading(
      'Chargement de vos soutenances...', 
      'Récupération de vos créneaux'
    )

    return this.http.get<SoutenanceEtudiantSlotDto[]>(
      `${this.planifUrl}/etudiant/${etudiantId}`
    ).pipe(
      switchMap(soutenances => timer(300).pipe(switchMap(() => [soutenances]))),
      
      tap((soutenances) => {
        this.notificationService.operationSuccess(
          loadingId,
          'Vos soutenances',
          `${soutenances.length} soutenance(s) programmée(s)`
        )
      }),
      
      catchError((error) => {
        this.notificationService.operationError(
          loadingId,
          'Soutenances',
          'Impossible de charger vos soutenances'
        )
        return this.handleError(error)
      })
    )
  }

  // ==================== STUDENT METHODS ====================

  getMyStages(): Observable<Stage[]> {
    const userEmail = this.authService.getUserEmail()
    if (!userEmail) {
      return throwError(() => new Error("User not authenticated"))
    }

    console.log("📋 Fetching stages for user email:", userEmail)
    
    const loadingId = this.notificationService.loading(
      'Chargement de vos stages...', 
      'Récupération de votre historique'
    )

    return this.http.get<Stage[]>(`${this.etudUrl}/mes-stages`).pipe(
      // Add delay for better UX
      switchMap(stages => timer(300).pipe(switchMap(() => [stages]))),
      
      tap((stages) => {
        this.notificationService.operationSuccess(
          loadingId,
          'Stages',
          `${stages.length} stage(s) trouvé(s)`
        )
      }),
      
      catchError((error) => {
        this.notificationService.operationError(
          loadingId,
          'Stages',
          'Impossible de charger vos stages'
        )
        return this.handleError(error)
      })
    )
  }

  createDemande(data: StageRequest): Observable<Stage> {
    const token = this.authService.getToken()
    
    const loadingId = this.notificationService.loading(
      'Création de la demande...', 
      'Soumission de votre demande de stage'
    )

    return this.http.post<Stage>(
      `${environment.apiUrl}/stages/etudiants/demande`,
      data,
      { headers: new HttpHeaders().set('Authorization', `Bearer ${token}`) }
    ).pipe(
      // Add delay for better UX
      switchMap(stage => timer(800).pipe(switchMap(() => [stage]))),
      
      tap((stage) => {
        this.notificationService.operationSuccess(
          loadingId,
          'Demande de stage',
          `Demande créée avec succès pour ${stage.entreprise}`
        )
      }),
      
      catchError((error) => {
        let errorMessage = 'Impossible de créer la demande'
        if (error.status === 400) {
          errorMessage = 'Données de la demande invalides'
        } else if (error.status === 409) {
          errorMessage = 'Vous avez déjà une demande en cours'
        }
        
        this.notificationService.operationError(
          loadingId,
          'Demande de stage',
          errorMessage
        )
        return this.handleError(error)
      })
    )
  }

  submitRapport(stageId: number, file: File): Observable<any> {
    const formData = new FormData()
    formData.append('file', file)

    const token = this.authService.getToken()
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    })

    const loadingId = this.notificationService.loading(
      'Soumission du rapport...', 
      `Upload de ${file.name} en cours`
    )

    return this.http.post(`${this.rapportUrl}/${stageId}`, formData, { headers }).pipe(
      // Add delay for upload simulation
      switchMap(response => timer(1200).pipe(switchMap(() => [response]))),
      
      tap(() => {
        this.notificationService.operationSuccess(
          loadingId,
          'Rapport',
          'Votre rapport a été soumis avec succès et sera examiné par votre encadrant'
        )
      }),
      
      catchError((error) => {
        let errorMessage = 'Impossible de soumettre le rapport'
        if (error.status === 413) {
          errorMessage = 'Fichier trop volumineux (max 10MB)'
        } else if (error.status === 415) {
          errorMessage = 'Format de fichier non supporté (PDF uniquement)'
        }
        
        this.notificationService.operationError(
          loadingId,
          'Rapport',
          errorMessage
        )
        return throwError(() => error)
      })
    )
  }

  downloadConvention(stageId: number): Observable<Blob> {
    const params = new HttpParams().set("idStage", stageId.toString())
    
    const loadingId = this.notificationService.loading(
      'Génération de la convention...', 
      'Préparation du document PDF'
    )

    return this.http.get(`${this.baseUrl}/convention`, {
      params,
      responseType: "blob",
    }).pipe(
      tap(() => {
        this.notificationService.operationSuccess(
          loadingId,
          'Convention',
          'Document téléchargé avec succès'
        )
      }),
      
      catchError((error) => {
        this.notificationService.operationError(
          loadingId,
          'Convention',
          'Impossible de générer la convention'
        )
        return this.handleError(error)
      })
    )
  }

  downloadAssurance(stageId: number): Observable<Blob> {
    const loadingId = this.notificationService.loading(
      'Téléchargement de l\'assurance...', 
      'Récupération du document'
    )

    return this.http.get(`${this.baseUrl}/${stageId}/documents`, {
      responseType: "blob",
    }).pipe(
      tap(() => {
        this.notificationService.operationSuccess(
          loadingId,
          'Assurance',
          'Attestation téléchargée avec succès'
        )
      }),
      
      catchError((error) => {
        this.notificationService.operationError(
          loadingId,
          'Assurance',
          'Impossible de télécharger l\'attestation'
        )
        return this.handleError(error)
      })
    )
  }

  // ==================== ENCADRANT METHODS ====================

  getMyAssignedStages(): Observable<Stage[]> {
    const loadingId = this.notificationService.loading(
      'Chargement de vos stages...', 
      'Récupération des stages assignés'
    )

    return this.http.get<Stage[]>(`${this.encadrantUrl}/me/stages`).pipe(
      switchMap(stages => timer(400).pipe(switchMap(() => [stages]))),
      
      tap((stages) => {
        this.notificationService.operationSuccess(
          loadingId,
          'Stages assignés',
          `${stages.length} stage(s) sous votre supervision`
        )
      }),
      
      catchError((error) => {
        this.notificationService.operationError(
          loadingId,
          'Stages assignés',
          'Impossible de charger vos stages'
        )
        return this.handleError(error)
      })
    )
  }

  approveDecision(dto: DecisionDto): Observable<{ message: string }> {
    const loadingId = this.notificationService.loading(
      'Traitement de la décision...', 
      dto.approuver ? 'Approbation en cours' : 'Rejet en cours'
    )

    return this.http.post<{ message: string }>(
      `${this.encadrantUrl}/decision`, 
      dto
    ).pipe(
      switchMap(response => timer(600).pipe(switchMap(() => [response]))),
      
      tap((response) => {
        const action = dto.approuver ? 'approuvée' : 'rejetée'
        this.notificationService.operationSuccess(
          loadingId,
          'Décision',
          `Demande ${action} avec succès`
        )
      }),
      
      catchError((error) => {
        this.notificationService.operationError(
          loadingId,
          'Décision',
          'Impossible de traiter la décision'
        )
        return this.handleError(error)
      })
    )
  }

  rejectStage(stageId: number, commentaire: string): Observable<string> {
    const userId = this.authService.getUserId()
    if (!userId) return throwError(() => new Error("User not authenticated"))
    
    const loadingId = this.notificationService.loading(
      'Rejet du stage...', 
      'Enregistrement du commentaire'
    )

    return this.http.put(
      `${this.encadrantUrl}/${userId}/stage/${stageId}/refuser`, 
      { commentaire },
      { 
        responseType: 'text',
        headers: new HttpHeaders().set('Content-Type', 'text/plain')
      }
    ).pipe(
      switchMap(response => timer(500).pipe(switchMap(() => [response]))),
      
      tap(() => {
        this.notificationService.operationSuccess(
          loadingId,
          'Stage rejeté',
          'Le stage a été rejeté avec commentaire'
        )
      }),
      
      catchError((error) => {
        this.notificationService.operationError(
          loadingId,
          'Rejet du stage',
          'Impossible de rejeter le stage'
        )
        return this.handleError(error)
      })
    )
  }

  getRapportsForEncadrant(): Observable<RapportDetails[]> {
    const loadingId = this.notificationService.loading(
      'Chargement des rapports...', 
      'Récupération des rapports soumis'
    )

    return this.http.get<RapportDetails[]>(`${this.encadrantUrl}/me/rapports/details`).pipe(
      switchMap(rapports => timer(400).pipe(switchMap(() => [rapports]))),
      
      tap((rapports) => {
        this.notificationService.operationSuccess(
          loadingId,
          'Rapports',
          `${rapports.length} rapport(s) trouvé(s)`
        )
      }),
      
      catchError((error) => {
        this.notificationService.operationError(
          loadingId,
          'Rapports',
          'Impossible de charger les rapports'
        )
        return this.handleError(error)
      })
    )
  }

  validateRapport(rapportId: number, commentaire?: string): Observable<Rapport> {
    const loadingId = this.notificationService.loading(
      'Validation du rapport...', 
      'Enregistrement de votre validation'
    )

    return this.http.put<Rapport>(`${this.encadrantUrl}/rapports/${rapportId}/validate`, {
      commentaire: commentaire || "",
    }).pipe(
      switchMap(rapport => timer(600).pipe(switchMap(() => [rapport]))),
      
      tap(() => {
        this.notificationService.operationSuccess(
          loadingId,
          'Rapport validé',
          'Le rapport a été validé avec succès'
        )
      }),
      
      catchError((error) => {
        this.notificationService.operationError(
          loadingId,
          'Validation',
          'Impossible de valider le rapport'
        )
        return this.handleError(error)
      })
    )
  }

  rejectRapport(rapportId: number, commentaire: string): Observable<Rapport> {
    const loadingId = this.notificationService.loading(
      'Rejet du rapport...', 
      'Enregistrement de votre commentaire'
    )

    return this.http.put<Rapport>(`${this.encadrantUrl}/rapports/${rapportId}/reject`, {
      commentaire,
    }).pipe(
      switchMap(rapport => timer(500).pipe(switchMap(() => [rapport]))),
      
      tap(() => {
        this.notificationService.operationSuccess(
          loadingId,
          'Rapport rejeté',
          'Le rapport a été rejeté avec commentaire'
        )
      }),
      
      catchError((error) => {
        this.notificationService.operationError(
          loadingId,
          'Rejet',
          'Impossible de rejeter le rapport'
        )
        return this.handleError(error)
      })
    )
  }

  // ==================== ADMIN METHODS ====================

  getAllStages(): Observable<Stage[]> {
    const loadingId = this.notificationService.loading(
      'Chargement de tous les stages...', 
      'Récupération des données administratives'
    )

    return this.http.get<Stage[]>(`${this.adminUrl}/stages`).pipe(
      switchMap(stages => timer(500).pipe(switchMap(() => [stages]))),
      
      tap((stages) => {
        this.notificationService.operationSuccess(
          loadingId,
          'Stages',
          `${stages.length} stage(s) dans le système`
        )
      }),
      
      catchError((error) => {
        this.notificationService.operationError(
          loadingId,
          'Stages',
          'Impossible de charger les stages'
        )
        return this.handleError(error)
      })
    )
  }

  getStageStats(): Observable<any> {
    const loadingId = this.notificationService.loading(
      'Calcul des statistiques...', 
      'Analyse des données'
    )

    return this.http.get<any>(`${this.adminUrl}/statistiques`).pipe(
      switchMap(stats => timer(600).pipe(switchMap(() => [stats]))),
      
      map(stats => ({
        total: stats.total || 0,
        enAttente: stats.enAttente || 0,
        valides: stats.valides || 0,
        refuses: stats.refuses || 0,
        enCours: stats.enCours || 0,
        totalEtudiants: stats.totalEtudiants || 0,
        totalEncadrants: stats.totalEncadrants || 0
      })),
      
      tap((stats) => {
        this.notificationService.operationSuccess(
          loadingId,
          'Statistiques',
          `Données analysées: ${stats.total} stages, ${stats.totalEtudiants} étudiants`
        )
      }),
      
      catchError((error) => {
        this.notificationService.operationError(
          loadingId,
          'Statistiques',
          'Impossible de calculer les statistiques'
        )
        return this.handleError(error)
      })
    )
  }

  assignerEncadrantGroupe(dto: GroupAssignmentRequest): Observable<{ message: string }> {
    const loadingId = this.notificationService.loading(
      'Affectation par groupe...', 
      'Attribution de l\'encadrant aux étudiants'
    )

    return this.http.post<{ message: string }>(
      `${this.adminUrl}/assigner-encadrant-groupe`,
      dto
    ).pipe(
      switchMap(response => timer(1000).pipe(switchMap(() => [response]))),
      
      tap((response) => {
        this.notificationService.operationSuccess(
          loadingId,
          'Affectation réussie',
          response.message || 'Encadrant affecté au groupe avec succès'
        )
      }),
      
      catchError((error) => {
        let errorMessage = 'Impossible d\'affecter l\'encadrant'
        if (error.status === 404) {
          errorMessage = 'Encadrant ou groupe non trouvé'
        } else if (error.status === 409) {
          errorMessage = 'Conflit d\'affectation détecté'
        }
        
        this.notificationService.operationError(
          loadingId,
          'Affectation',
          errorMessage
        )
        return this.handleError(error)
      })
    )
  }

  // ==================== ENHANCED METHODS WITH ANIMATIONS ====================

  downloadRapport(stageId: number): Observable<HttpResponse<Blob>> {
    const loadingId = this.notificationService.loading(
      'Téléchargement du rapport...', 
      'Préparation du fichier PDF'
    )

    return this.http.get(
      `${this.rapportUrl}/${stageId}/download`,
      { 
        responseType: 'blob',
        withCredentials: true,
        observe: 'response'
      }
    ).pipe(
      tap(() => {
        this.notificationService.operationSuccess(
          loadingId,
          'Téléchargement',
          'Rapport téléchargé avec succès'
        )
      }),
      
      catchError((error) => {
        this.notificationService.operationError(
          loadingId,
          'Téléchargement',
          'Impossible de télécharger le rapport'
        )
        return throwError(() => error)
      })
    )
  }

  getMesDemandes(): Observable<Stage[]> {
    const loadingId = this.notificationService.loading(
      'Chargement des demandes...', 
      'Récupération des demandes en attente'
    )

    return this.http.get<Stage[]>(`${this.encadrantUrl}/me/demandes`).pipe(
      switchMap(demandes => timer(300).pipe(switchMap(() => [demandes]))),
      
      tap((demandes) => {
        this.notificationService.operationSuccess(
          loadingId,
          'Demandes',
          `${demandes.length} demande(s) en attente de validation`
        )
      }),
      
      catchError((error) => {
        this.notificationService.operationError(
          loadingId,
          'Demandes',
          'Impossible de charger les demandes'
        )
        return this.handleError(error)
      })
    )
  }

  getExistingRapport(stageId: number): Observable<Rapport | null> {
    const token = this.authService.getToken()
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    })

    return this.http.get<Rapport | null>(
      `${environment.apiUrl}/stages/etudiants/rapport/${stageId}`,
      { headers }
    ).pipe(
      catchError(() => of(null))
    )
  }

  // ==================== REFERENCE DATA METHODS ====================

  listDepartements(): Observable<{id: number, nom: string}[]> {
    const loadingId = this.notificationService.loading(
      'Chargement des départements...', 
      'Récupération de la liste'
    )

    return this.http.get<{id: number, nom: string}[]>(`${this.adminUrl}/departements`).pipe(
      tap((deps) => {
        this.notificationService.operationSuccess(
          loadingId,
          'Départements',
          `${deps.length} département(s) disponible(s)`
        )
      }),
      
      catchError((error) => {
        this.notificationService.operationError(
          loadingId,
          'Départements',
          'Impossible de charger les départements'
        )
        return this.handleError(error)
      })
    )
  }

  listClassGroups(depId: number): Observable<{id: number, nom: string}[]> {
    const loadingId = this.notificationService.loading(
      'Chargement des groupes...', 
      'Récupération des classes'
    )

    return this.http.get<{id: number, nom: string}[]>(
      `${this.adminUrl}/departements/${depId}/class-groups`
    ).pipe(
      tap((groups) => {
        this.notificationService.operationSuccess(
          loadingId,
          'Groupes',
          `${groups.length} groupe(s) trouvé(s)`
        )
      }),
      
      catchError((error) => {
        this.notificationService.operationError(
          loadingId,
          'Groupes',
          'Impossible de charger les groupes'
        )
        return this.handleError(error)
      })
    )
  }

  listAnneesScolaires(): Observable<{id: number, libelle: string}[]> {
    const loadingId = this.notificationService.loading(
      'Chargement des années scolaires...', 
      'Récupération des données'
    )

    return this.http.get<{id: number, libelle: string}[]>(
      `${this.adminUrl}/annee-scolaires`
    ).pipe(
      tap((years) => {
        this.notificationService.operationSuccess(
          loadingId,
          'Années scolaires',
          `${years.length} année(s) disponible(s)`
        )
      }),
      
      catchError((error) => {
        this.notificationService.operationError(
          loadingId,
          'Années scolaires',
          'Impossible de charger les années'
        )
        return this.handleError(error)
      })
    )
  }

  listAllClassGroups(): Observable<{id: number, nom: string}[]> {
    const loadingId = this.notificationService.loading(
      'Chargement de tous les groupes...', 
      'Récupération complète'
    )

    return this.http.get<{id: number, nom: string}[]>(
      `${this.adminUrl}/class-groups`
    ).pipe(
      tap((groups) => {
        this.notificationService.operationSuccess(
          loadingId,
          'Tous les groupes',
          `${groups.length} groupe(s) dans le système`
        )
      }),
      
      catchError((error) => {
        this.notificationService.operationError(
          loadingId,
          'Groupes',
          'Impossible de charger tous les groupes'
        )
        return this.handleError(error)
      })
    )
  }

  // ==================== COMMENT METHODS ====================

  listCommentaires(etudiantFilter?: string): Observable<CommentaireRapport[]> {
    let params = etudiantFilter
      ? new HttpParams().set('etudiant', etudiantFilter)
      : undefined

    const loadingId = this.notificationService.loading(
      'Chargement des commentaires...', 
      'Récupération de l\'historique'
    )

    return this.http.get<CommentaireRapport[]>(
      `${this.encadrantUrl}/me/commentaires`,
      { params }
    ).pipe(
      tap((comments) => {
        this.notificationService.operationSuccess(
          loadingId,
          'Commentaires',
          `${comments.length} commentaire(s) trouvé(s)`
        )
      }),
      
      catchError((error) => {
        this.notificationService.operationError(
          loadingId,
          'Commentaires',
          'Impossible de charger les commentaires'
        )
        return this.handleError(error)
      })
    )
  }

  addComment(rapportId: number, texte: string): Observable<CommentaireRapport> {
    const token = this.authService.getToken()
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    })

    const loadingId = this.notificationService.loading(
      'Ajout du commentaire...', 
      'Enregistrement en cours'
    )

    return this.http.post<CommentaireRapport>(
      `${this.encadrantUrl}/${rapportId}/commentaire`,
      { texte },
      { headers }
    ).pipe(
      switchMap(comment => timer(400).pipe(switchMap(() => [comment]))),
      
      tap(() => {
        this.notificationService.operationSuccess(
          loadingId,
          'Commentaire ajouté',
          'Votre commentaire a été enregistré'
        )
      }),
      
      catchError((error) => {
        this.notificationService.operationError(
          loadingId,
          'Commentaire',
          'Impossible d\'ajouter le commentaire'
        )
        return this.handleError(error)
      })
    )
  }

  // ==================== UTILITY METHODS ====================

  getAssignments(): Observable<any[]> {
    const loadingId = this.notificationService.loading(
      'Chargement des affectations...', 
      'Récupération des associations'
    )

    return this.http.get<any[]>(`${this.adminUrl}/assignments`).pipe(
      tap((assignments) => {
        this.notificationService.operationSuccess(
          loadingId,
          'Affectations',
          `${assignments.length} affectation(s) trouvée(s)`
        )
      }),
      
      catchError(() => {
        this.notificationService.remove(loadingId)
        return of([])
      })
    )
  }

  removeAssignment(assignmentId: number): Observable<void> {
    const loadingId = this.notificationService.loading(
      'Suppression de l\'affectation...', 
      'Retrait de l\'association'
    )

    return this.http.delete<void>(`${this.adminUrl}/assignments/${assignmentId}`).pipe(
      switchMap(response => timer(400).pipe(switchMap(() => [response]))),
      
      tap(() => {
        this.notificationService.operationSuccess(
          loadingId,
          'Affectation supprimée',
          'L\'association a été retirée avec succès'
        )
      }),
      
      catchError((error) => {
        this.notificationService.operationError(
          loadingId,
          'Suppression',
          'Impossible de supprimer l\'affectation'
        )
        return this.handleError(error)
      })
    )
  }

  // ==================== BATCH OPERATIONS ====================

  batchApproveStages(stageIds: number[]): Observable<any> {
    const operations = stageIds.map(id => `Approbation stage #${id}`)
    
    this.notificationService.batchOperation(operations, () => {
      this.notificationService.successWithBounce(
        'Approbations terminées',
        `${stageIds.length} stages approuvés avec succès`
      )
    })

    // Simulate batch processing
    return timer(2000).pipe(
      map(() => ({ success: true, count: stageIds.length }))
    )
  }

  batchRejectStages(stageIds: number[], reason: string): Observable<any> {
    const operations = stageIds.map(id => `Rejet stage #${id}`)
    
    this.notificationService.batchOperation(operations, () => {
      this.notificationService.successWithBounce(
        'Rejets terminés',
        `${stageIds.length} stages rejetés avec motif: ${reason}`
      )
    })

    return timer(2000).pipe(
      map(() => ({ success: true, count: stageIds.length }))
    )
  }

  // ==================== PERFORMANCE OPTIMIZED METHODS ====================

  // Cached methods for better performance
  private departementCache: {id: number, nom: string}[] | null = null
  private cacheTimestamp: number = 0
  private cacheTimeout = 5 * 60 * 1000 // 5 minutes

  listDepartementsOptimized(): Observable<{id: number, nom: string}[]> {
    const now = Date.now()
    
    // Return cached data if available and fresh
    if (this.departementCache && (now - this.cacheTimestamp) < this.cacheTimeout) {
      return of(this.departementCache)
    }

    return this.listDepartements().pipe(
      tap((deps) => {
        this.departementCache = deps
        this.cacheTimestamp = now
      })
    )
  }

  // Clear cache when needed
  clearCache(): void {
    this.departementCache = null
    this.cacheTimestamp = 0
    this.notificationService.info('Cache vidé', 'Données actualisées')
  }

  // ==================== ERROR HANDLING ====================

  private handleError = (error: any): Observable<never> => {
    console.error("🚨 StageService error:", error)
    
    let errorMessage = "Une erreur est survenue"

    if (error.status === 401) {
      errorMessage = "Session expirée. Veuillez vous reconnecter."
      // Auto logout on 401
      setTimeout(() => this.authService.logout(), 1000)
    } else if (error.status === 403) {
      errorMessage = "Accès refusé."
    } else if (error.status === 404) {
      errorMessage = "Ressource non trouvée."
    } else if (error.status === 0) {
      errorMessage = "Impossible de se connecter au serveur."
    } else if (error.error?.message) {
      errorMessage = error.error.message
    }

    return throwError(() => new Error(errorMessage))
  }

  // ==================== ADDITIONAL UTILITY METHODS ====================

  getMyStageStatus(): Observable<string> {
    return this.http.get<string>(`${this.baseUrl}/etat/mes-demandes`).pipe(
      catchError(this.handleError)
    )
  }

  getRapportUrl(stageId: number): Observable<string> {
    const token = this.authService.getToken()
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    })

    return this.http.get(`${this.encadrantUrl}/${stageId}/url`, { 
      headers, 
      responseType: 'text' 
    })
  }

  getRapportsByStage(stageId: number): Observable<Rapport[]> {
    return this.http.get<Rapport[]>(`${this.rapportUrl}/stage/${stageId}`).pipe(
      catchError(this.handleError)
    )
  }

  addNote(stageId: number, note: string): Observable<any> {
    const userId = this.getCurrentUserId()
    if (!userId) {
      return throwError(() => new Error("User not authenticated"))
    }

    const loadingId = this.notificationService.loading(
      'Ajout de la note...', 
      'Enregistrement du commentaire'
    )

    return this.http.put(
      `${this.encadrantUrl}/${userId}/stage/${stageId}/note`,
      {},
      {
        params: new HttpParams().set("commentaire", note),
      },
    ).pipe(
      tap(() => {
        this.notificationService.operationSuccess(
          loadingId,
          'Note ajoutée',
          'Votre commentaire a été enregistré'
        )
      }),
      
      catchError((error) => {
        this.notificationService.operationError(
          loadingId,
          'Note',
          'Impossible d\'ajouter la note'
        )
        return this.handleError(error)
      })
    )
  }

  uploadStageDocuments(stageId: number, assurance: File, convention: File): Observable<any> {
    const formData = new FormData()
    formData.append("files", assurance)
    formData.append("files", convention)
    formData.append("types", "ASSURANCE")
    formData.append("types", "CONVENTION")

    const loadingId = this.notificationService.loading(
      'Upload des documents...', 
      'Téléversement en cours'
    )

    return this.http.put(`${this.adminUrl}/${stageId}/documents`, formData).pipe(
      switchMap(response => timer(800).pipe(switchMap(() => [response]))),
      
      tap(() => {
        this.notificationService.operationSuccess(
          loadingId,
          'Documents',
          'Documents téléversés avec succès'
        )
      }),
      
      catchError((error) => {
        this.notificationService.operationError(
          loadingId,
          'Documents',
          'Impossible de téléverser les documents'
        )
        return this.handleError(error)
      })
    )
  }

  // Pagination support
  getPaginatedStages(page: number, size: number): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
        
    const loadingId = this.notificationService.loading(
      `Chargement page ${page + 1}...`, 
      'Récupération des données'
    )

    return this.http.get<any>(`${this.adminUrl}/stages`, { params }).pipe(
      tap((data) => {
        this.notificationService.operationSuccess(
          loadingId,
          'Pagination',
          `Page ${page + 1} chargée (${data.content?.length || 0} éléments)`
        )
      }),
      
      catchError((error) => {
        this.notificationService.operationError(
          loadingId,
          'Pagination',
          'Impossible de charger la page'
        )
        return throwError(() => error)
      })
    )
  }

  private getCurrentUserId(): number | null {
    return this.authService.getUserId()
  }

  // Additional methods for completeness
  getStagesDtoParEtudiant(idEtudiant: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/etudiant/${idEtudiant}/dto`).pipe(
      catchError(this.handleError)
    )
  }

  getStagesDtoParEncadrant(idEncadrant: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/encadrant/${idEncadrant}/dto`).pipe(
      catchError(this.handleError)
    )
  }

  getRapportEntityByStage(idStage: number): Observable<Rapport> {
    return this.http.get<Rapport>(`${this.rapportUrl}/stage/${idStage}/entity`).pipe(
      catchError(this.handleError)
    )
  }

  getRapportUrlByStage(stageId: number): Observable<string | null> {
    return this.http.get(`${this.rapportUrl}/${stageId}/url`, { responseType: 'text' }).pipe(
      catchError(() => of(null))
    )
  }

  getDemandesParEncadrant(idEncadrant: number): Observable<Stage[]> {
    return this.http.get<Stage[]>(`${this.encadrantUrl}/${idEncadrant}/demandes`).pipe(
      catchError(this.handleError)
    )
  }

  getExistingRapportDto(stageId: number): Observable<any> {
    return this.http.get<any>(`${this.rapportUrl}/stage/${stageId}/dto`).pipe(
      catchError(() => of(null))
    )
  }
}