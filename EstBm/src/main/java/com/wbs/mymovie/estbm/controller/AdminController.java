//package com.wbs.mymovie.estbm.controller;
//
//import com.wbs.mymovie.estbm.dto.RegisterRequest;
//import com.wbs.mymovie.estbm.service.StageService;
//import com.wbs.mymovie.estbm.service.UtilisateurService;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.*;
//import org.springframework.web.multipart.MultipartFile;
//import com.wbs.mymovie.estbm.dto.AssignmentDto;
//
//@RestController
//@RequestMapping("/stages/admin")
//public class AdminController {
//
//    @Autowired
//    private UtilisateurService utilisateurService;
//
//    @Autowired
//    private StageService stageService;
//
//    /**
//     * Créer un compte encadrant
//     */
//    @PostMapping("/encadrants")
//    public ResponseEntity<?> creerEncadrant(@RequestBody RegisterRequest req) {
//        return ResponseEntity.ok(utilisateurService.creerCompteEncadrant(req));
//    }
//
//    /**
//     * Statistiques globales
//     */
//    @GetMapping("/statistiques")
//    public ResponseEntity<?> getStats() {
//        return ResponseEntity.ok(stageService.getStatistiques());
//    }
//
//    /**
//     * Exporter les listes (format = csv ou pdf)
//     */
//    @GetMapping("/export")
//    public ResponseEntity<?> exporterListes(@RequestParam String format) {
//        return stageService.exporterListes(format);
//    }
//
//    /**
//     * Générer automatiquement la convention d’un stage
//     */
//    @PostMapping("/generer-convention")
//    public ResponseEntity<?> genererConvention(@RequestParam Long idStage) {
//        return stageService.genererConventionAuto(idStage);
//    }
//
//    /**
//     * Attribuer un encadrant à un stage
//     */
//    @PostMapping("/assigner-encadrant")
//    public ResponseEntity<?> assignerEncadrant(
//            @RequestParam Long idStage,
//            @RequestParam Long idEncadrant) {
//        return stageService.assignerEncadrant(idStage, idEncadrant);
//    }
//
//    /**
//     * Attribuer un document de convention
//     */
//    @PostMapping("/attribuer-convention")
//    public ResponseEntity<?> attribuerConvention(@RequestParam Long idStage,
//                                                 @RequestParam("file") MultipartFile file) {
//        return stageService.attribuerDocument(idStage, file, "Convention");
//    }
//
//    /**
//     * Attribuer un document d’assurance
//     */
//    @PostMapping("/attribuer-assurance")
//    public ResponseEntity<?> attribuerAssurance(@RequestParam Long idStage,
//                                                @RequestParam("file") MultipartFile file) {
//        return stageService.attribuerDocument(idStage, file, "Assurance");
//    }
//
//
//    // src/main/java/com/wbs/mymovie/estbm/controller/AdminController.java
//    @PostMapping("/assigner-encadrant")
//    public ResponseEntity<?> assignerEncadrantAEtudiant(@RequestBody AssignmentDto dto) {
//        return stageService.assignerEncadrantAEtudiant(dto);
//    }
//
//
//}


// src/main/java/com/wbs/mymovie/estbm/controller/AdminController.java
package com.wbs.mymovie.estbm.controller;

import com.wbs.mymovie.estbm.dto.*;
import com.wbs.mymovie.estbm.model.Stage;
import com.wbs.mymovie.estbm.model.Utilisateur;
import com.wbs.mymovie.estbm.model.enums.Role;
import com.wbs.mymovie.estbm.repository.EtudiantRepository;
import com.wbs.mymovie.estbm.service.AdminService;
import com.wbs.mymovie.estbm.service.EtudiantService;
import com.wbs.mymovie.estbm.service.StageService;
import com.wbs.mymovie.estbm.service.UtilisateurService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;


@RestController
@RequestMapping("/stages/admin")
public class AdminController {

    @Autowired
    private UtilisateurService utilisateurService;

    @Autowired
    private EtudiantRepository etudiantRepository;

    @Autowired
    private StageService stageService;
    @Autowired
    private EtudiantService etudiantService;
    @Autowired
    private AdminService adminService;

    @PostMapping("/encadrants")
    public ResponseEntity<?> creerEncadrant(@RequestBody RegisterRequest req) {
        return ResponseEntity.ok(utilisateurService.creerCompteEncadrant(req));
    }


    @GetMapping("/assignments")
    public ResponseEntity<List<AssignmentDto>> getAssignments() {
        List<AssignmentDto> dtos = stageService.getAssignments();
        return ResponseEntity.ok(dtos);
    }



    // StageController.java
    @GetMapping("/statistiques")
    public ResponseEntity<Map<String, Object>> getStatistiques() {
        Map<String, Object> stats = stageService.getStatistiques();
        // Add totalEtudiants if needed
        stats.put("totalEtudiants", etudiantRepository.count());
        return ResponseEntity.ok(stats);
    }
    /** Exporter les listes */
    @GetMapping("/export")
    public ResponseEntity<?> exporterListes(@RequestParam String format) {
        return stageService.exporterListes(format);
    }

    /** Générer automatiquement la convention d’un stage */
    @PostMapping("/generer-convention")
    public ResponseEntity<?> genererConvention(@RequestParam Long idStage) {
        return stageService.genererConventionAuto(idStage);
    }

    /**
     * Attribuer un encadrant à un étudiant
     */
    @PostMapping("/assigner-encadrant")
    public ResponseEntity<?> assignerEncadrantAEtudiant(@RequestBody AssignmentDto dto) {
        return stageService.assignerEncadrantAEtudiant(dto);
    }




    /** Attribuer un document de convention */
    @PostMapping("/attribuer-convention")
    public ResponseEntity<?> attribuerConvention(@RequestParam Long idStage,
                                                 @RequestParam("file") MultipartFile file) {
        return stageService.attribuerDocument(idStage, file, "Convention");
    }

    /** Attribuer un document d’assurance */
    @PostMapping("/attribuer-assurance")
    public ResponseEntity<?> attribuerAssurance(@RequestParam Long idStage,
                                                @RequestParam("file") MultipartFile file) {
        return stageService.attribuerDocument(idStage, file, "Assurance");
    }

    @PutMapping("/{id}/documents")
    public ResponseEntity<String> ajouterDocuments(
            @PathVariable("id") Long stageId,
            @RequestPart("files") List<MultipartFile> files,
            @RequestPart("types") List<String> types
    ) throws IOException {
        // files.size()==types.size()==2
        stageService.ajouterDocuments(stageId, files, types);
        return ResponseEntity.ok("Documents ajoutés avec succès");
    }


    @GetMapping("/users")
    public ResponseEntity<List<Utilisateur>> getAllUsers() {
        return ResponseEntity.ok(utilisateurService.getAllUsers());
    }

//    @GetMapping("/stages")
//    public ResponseEntity<List<Stage>> getAllStages() {
//        return ResponseEntity.ok(stageService.getAllStages());
//    }

    @GetMapping("/stages")
    public List<StageDto> getAllStages() {
        return stageService.findAllDtos();
    }

    @GetMapping("/users/role/{role}")
    public ResponseEntity<List<Utilisateur>> getUsersByRole(
            @PathVariable("role") String roleStr) {

        Role role;
        try {
            role = Role.valueOf(roleStr);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(utilisateurService.getByRole(role));
    }








    @PostMapping("/assigner-encadrant-groupe")
    public ResponseEntity<Map<String,String>> assignerEncadrantGroupe(
            @RequestBody AssignmentDto dto) {
        int count = adminService.assignerEncadrantParGroupe(
                dto.getEncadrantId(),
                dto.getDepartementId(),
                dto.getClasseGroupeId(),
                dto.getAnneeScolaireId());
        return ResponseEntity.ok(Map.of(
                "message", "Encadrant affecté à " + count + " étudiants"
        ));
    }


//    @PostMapping("/assigner-encadrant-groupe")
//    public ResponseEntity<?> assignerEncadrantGroupe(
//            @RequestParam Long encadrantId,
//            @RequestParam Long departementId,
//            @RequestParam Long classeGroupeId,
//            @RequestParam Long anneeScolaireId) {
//
//        int count = adminService.assignerEncadrantParGroupe(
//                encadrantId, departementId, classeGroupeId, anneeScolaireId);
//
//        return ResponseEntity.ok(
//                Map.of("message", "Encadrant affecté à " + count + " étudiants")
//        );
//    }

//    @PostMapping("/assigner-encadrant-groupe")
//    public ResponseEntity<?> assignerEncadrantGroupe(
//            @RequestBody GroupAssignmentRequest request) {
//
//        int count = adminService.assignerEncadrantParGroupe(
//                request.getEncadrantId(),
//                request.getDepartementId(),
//                request.getClasseGroupeId(),
//                request.getAnneeScolaireId());
//
//        return ResponseEntity.ok(
//                Map.of("message", "Encadrant affecté à " + count + " étudiants")
//        );
//    }



    @GetMapping("/departements")
    public ResponseEntity<List<ReferenceDto>> listDepartements() {
        List<ReferenceDto> deps = adminService.listDepartements();
        return ResponseEntity.ok(deps);
    }

//    /** Lister les groupes de la sélection */
//    @GetMapping("/departements/{depId}/class-groups")
//    public ResponseEntity<List<ReferenceDto>> listClassGroups(
//            @PathVariable Long depId) {
//        List<ReferenceDto> groups = adminService.listClassGroups(depId);
//        return ResponseEntity.ok(groups);
//    }

    /** Lister toutes les années scolaires */
    @GetMapping("/annee-scolaires")
    public ResponseEntity<List<ReferenceDto>> listAnneesScolaires() {
        List<ReferenceDto> years = adminService.listAnneesScolaires();
        return ResponseEntity.ok(years);
    }



    // Endpoint existant (groupes par département)
    @GetMapping("/departements/{depId}/class-groups")
    public ResponseEntity<List<ReferenceDto>> listClassGroups(
            @PathVariable Long depId) {
        List<ReferenceDto> groups = adminService.listClassGroupsByDepartment(depId); // Appel modifié
        return ResponseEntity.ok(groups);
    }

    // Nouvel endpoint (tous groupes)
    @GetMapping("/class-groups")
    public ResponseEntity<List<ReferenceDto>> listAllClassGroups() { // Nom cohérent
        List<ReferenceDto> groups = adminService.listAllClassGroups(); // Appel modifié
        return ResponseEntity.ok(groups);
    }



}
