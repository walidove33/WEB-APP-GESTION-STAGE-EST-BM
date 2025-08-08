package com.wbs.mymovie.estbm.service;

import com.wbs.mymovie.estbm.dto.*;
import com.wbs.mymovie.estbm.model.*;
import com.wbs.mymovie.estbm.repository.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PlanificationSoutenanceService {

    private final PlanificationSoutenanceRepository planificationRepo;
    private final DetailSoutenanceRepository detailRepo;
    private final EtudiantRepository etudiantRepo;
    private final EncadrantRepository encadrantRepository;
    private final DepartementRepository departementRepository;
    private final ClasseGroupeRepository classeGroupeRepository;
    private final AnneeScolaireRepository anneeScolaireRepository;



//    public PlanificationSoutenanceResponse createPlanification(PlanificationSoutenance planif) {
//        PlanificationSoutenance saved = planificationRepo.save(planif);
//
//        // Rechargez l'entité avec toutes les associations
//        PlanificationSoutenance fullEntity = planificationRepo.findByIdWithAssociations(saved.getId())
//                .orElseThrow(() -> new RuntimeException("Planification non trouvée après création"));
//
//        return mapToResponseDto(fullEntity);
//    }

    @Transactional
    public PlanificationSoutenanceResponse createPlanification(
            @   Valid PlanificationRequest req
    ) {
        // Parse the ISO-date string into a LocalDate
        LocalDate date = LocalDate.parse(
                req.getDateSoutenance(),
                DateTimeFormatter.ISO_LOCAL_DATE
        );

        // Build the entity, attaching proxies for each FK
        PlanificationSoutenance p = new PlanificationSoutenance();
        p.setDateSoutenance(date);
        p.setEncadrant(
                encadrantRepository.getReferenceById(req.getEncadrantId())
        );
        p.setDepartement(
                departementRepository.getReferenceById(req.getDepartementId())
        );
        p.setClasseGroupe(
                classeGroupeRepository.getReferenceById(req.getClasseGroupeId())
        );
        p.setAnneeScolaire(
                anneeScolaireRepository.getReferenceById(req.getAnneeScolaireId())
        );

        PlanificationSoutenance saved = planificationRepo.save(p);
        PlanificationSoutenance full  = planificationRepo
                .findByIdWithAssociations(saved.getId())
                .orElseThrow(() ->
                        new RuntimeException("Planification non trouvée après création")
                );

        return mapToResponseDto(full);
    }

    public List<PlanificationSoutenance> getPlanificationsByEncadrant(Long encadrantId) {
        return planificationRepo.findByEncadrantId(encadrantId);
    }

    public List<DetailSoutenance> getDetailsByPlanification(Long planifId) {
        return detailRepo.findByPlanificationId(planifId);
    }

//    public DetailSoutenance addDetailToPlanification(Long planifId, DetailSoutenance detail) {
//        PlanificationSoutenance planif = planificationRepo.findById(planifId)
//                .orElseThrow(() -> new RuntimeException("Planification non trouvée"));
//
//        // Hériter la date de la planification parente
//        detail.setDateSoutenance(planif.getDateSoutenance());
//        detail.setPlanification(planif);
//
//        return detailRepo.save(detail);
//    }


    public List<PlanificationSoutenanceResponse> getByEncadrant(Long encadrantId) {
        return planificationRepo.findByEncadrantId(encadrantId).stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    /**
     * Récupère les détails (créneaux) pour un étudiant.
     */
    public List<SoutenanceEtudiantSlotDto> getDetailsByEtudiant(Long etudiantId) {
        return detailRepo.findByEtudiantIdWithPlanification(etudiantId).stream()
                .map(d -> {
                    SoutenanceEtudiantSlotDto dto = new SoutenanceEtudiantSlotDto();
                    dto.setEtudiantId(d.getEtudiant().getId());
                    dto.setDate(d.getDateSoutenance());
                    dto.setHeureDebut(d.getHeureDebut());
                    dto.setHeureFin(d.getHeureFin());
                    dto.setSujet(d.getSujet());
                    return dto;
                })
                .collect(Collectors.toList());
    }


    public DetailSoutenance addDetailToPlanification(Long planifId, DetailSoutenance detail) {
        PlanificationSoutenance planif = planificationRepo.findById(planifId)
                .orElseThrow(() -> new RuntimeException("Planification non trouvée"));

        // Hérite la date de la planif
        detail.setDateSoutenance(planif.getDateSoutenance());
        detail.setPlanification(planif);
        return detailRepo.save(detail);
    }
//
//    public List<SoutenanceEtudiantSlotDto> getDetailsByEtudiant(Long etudiantId) {
//        return detailRepo.findByEtudiantId(etudiantId).stream().map(detail -> {
//            SoutenanceEtudiantSlotDto dto = new SoutenanceEtudiantSlotDto();
//            dto.setEtudiantId(detail.getEtudiant().getId());
//            dto.setDate(detail.getDateSoutenance()); // Date récupérée
//            dto.setHeureDebut(detail.getHeureDebut());
//            dto.setHeureFin(detail.getHeureFin());
//            dto.setSujet(detail.getSujet());
//            return dto;
//        }).collect(Collectors.toList());
//    }

    private PlanificationSoutenanceResponse mapToResponseDto(PlanificationSoutenance p) {
        PlanificationSoutenanceResponse r = new PlanificationSoutenanceResponse();
        r.setId(p.getId());
        r.setDateSoutenance(p.getDateSoutenance());

        // Encadrant
        Encadrant e = p.getEncadrant();
        if (e != null) {
            EncadrantDetailsDto ed = new EncadrantDetailsDto();
            ed.setId(e.getId());
            ed.setNom(e.getNom());
            ed.setPrenom(e.getPrenom());
            ed.setSpecialite(e.getSpecialite());
            if (e.getDepartement() != null) {
                DepartementDto dep = new DepartementDto();
                dep.setId(e.getDepartement().getId());
                dep.setNom(e.getDepartement().getNom());
                ed.setDepartement(dep);
            }
            r.setEncadrant(ed);
        }

        // Département
        if (p.getDepartement() != null) {
            DepartementDto dep = new DepartementDto();
            dep.setId(p.getDepartement().getId());
            dep.setNom(p.getDepartement().getNom());
            r.setDepartement(dep);
        }
        // Classe
        if (p.getClasseGroupe() != null) {
            ClasseGroupeDto cg = new ClasseGroupeDto();
            cg.setId(p.getClasseGroupe().getId());
            cg.setNom(p.getClasseGroupe().getNom());
            r.setClasseGroupe(cg);
        }
        // Année
        if (p.getAnneeScolaire() != null) {
            AnneeScolaireDto a = new AnneeScolaireDto();
            a.setId(p.getAnneeScolaire().getId());
            a.setLibelle(p.getAnneeScolaire().getLibelle());
            r.setAnneeScolaire(a);
        }

        return r;
    }


    public DetailSoutenance updateDetail(Long detailId, DetailSoutenance updatedDetail) {
        DetailSoutenance existing = detailRepo.findById(detailId)
                .orElseThrow(() -> new RuntimeException("Détail non trouvé"));

        existing.setSujet(updatedDetail.getSujet());
        existing.setHeureDebut(updatedDetail.getHeureDebut());
        existing.setHeureFin(updatedDetail.getHeureFin());

        // Ajouter validation chevauchement ici
        return detailRepo.save(existing);
    }


    public List<PlanificationSoutenanceResponse> getAll() {
        return planificationRepo.findAll().stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }


}
