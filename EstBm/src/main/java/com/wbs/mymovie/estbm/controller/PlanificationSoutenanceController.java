package com.wbs.mymovie.estbm.controller;

import com.wbs.mymovie.estbm.dto.PlanificationRequest;
import com.wbs.mymovie.estbm.dto.PlanificationSoutenanceResponse;
import com.wbs.mymovie.estbm.dto.SoutenanceEtudiantSlotDto;
import com.wbs.mymovie.estbm.model.DetailSoutenance;
import com.wbs.mymovie.estbm.model.PlanificationSoutenance;
import com.wbs.mymovie.estbm.service.PlanificationSoutenanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/stages/planification")
@RequiredArgsConstructor
public class PlanificationSoutenanceController {

    private final PlanificationSoutenanceService service;

    // ADMIN crée une planification
    @PostMapping("/create")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PlanificationSoutenanceResponse> create(
            @RequestBody PlanificationRequest request
    ) {
        return ResponseEntity.ok(service.createPlanification(request));
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<PlanificationSoutenanceResponse>> all() {
        return ResponseEntity.ok(service.getAll());
    }



    // ENCADRANT ajoute les détails d'un étudiant
    @PostMapping("/{planifId}/addDetail")
    @PreAuthorize("hasRole('ENCADRANT')")
    public ResponseEntity<?> addDetail(@PathVariable Long planifId,
                                       @RequestBody DetailSoutenance detail) {
        return ResponseEntity.ok(service.addDetailToPlanification(planifId, detail));
    }

    @GetMapping("/encadrant/{id}")
    @PreAuthorize("hasRole('ENCADRANT')")
    public ResponseEntity<List<PlanificationSoutenanceResponse>> byEncadrant(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(service.getByEncadrant(id));
    }

//    // ENCADRANT récupère ses planifications
//    @GetMapping("/encadrant/{id}")
//    @PreAuthorize("hasRole('ENCADRANT')")
//    public ResponseEntity<?> getByEncadrant(@PathVariable Long id) {
//        return ResponseEntity.ok(service.getPlanificationsByEncadrant(id));
//    }

//    // ETUDIANT consulte ses détails
//    @GetMapping("/etudiant/{id}")
//    @PreAuthorize("hasRole('ETUDIANT')")
//    public ResponseEntity<?> getByEtudiant(@PathVariable Long id) {
//        return ResponseEntity.ok(service.getDetailsByEtudiant(id));
//    }


    // ETUDIANT : consulter son créneau
    @GetMapping("/etudiant/{id}")
    @PreAuthorize("hasRole('ETUDIANT')")
    public ResponseEntity<List<SoutenanceEtudiantSlotDto>> byEtudiant(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(service.getDetailsByEtudiant(id));
    }

    // ADMIN / ENCADRANT affiche tous les détails
    @GetMapping("/{planifId}/details")
    @PreAuthorize("hasRole('ADMIN') or hasRole('ENCADRANT')")
    public ResponseEntity<?> getDetails(@PathVariable Long planifId) {
        return ResponseEntity.ok(service.getDetailsByPlanification(planifId));
    }

    @PutMapping("/details/{id}")
    @PreAuthorize("hasRole('ENCADRANT')")
    public ResponseEntity<DetailSoutenance> updateDetail(
            @PathVariable Long id,
            @RequestBody DetailSoutenance detail) {
        return ResponseEntity.ok(service.updateDetail(id, detail));
    }
}
