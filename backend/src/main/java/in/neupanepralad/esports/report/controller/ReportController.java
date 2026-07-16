package in.neupanepralad.esports.report.controller;

import in.neupanepralad.esports.report.model.ReportType;
import in.neupanepralad.esports.report.service.TournamentReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.nio.charset.StandardCharsets;
import java.util.UUID;

@RestController
@RequestMapping("/tournaments/{tournamentId}/reports")
@RequiredArgsConstructor
public class ReportController {

    private final TournamentReportService reportService;

    @GetMapping("/{type}")
    public ResponseEntity<byte[]> generate(
            @PathVariable UUID tournamentId,
            @PathVariable ReportType type,
            @RequestParam(required = false) UUID stageId,
            Authentication authentication
    ) {
        var report = reportService.generate(
                tournamentId,
                UUID.fromString(authentication.getName()),
                type,
                stageId
        );
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("text/csv"))
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.attachment()
                                .filename(report.filename(), StandardCharsets.UTF_8)
                                .build()
                                .toString()
                )
                .body(report.content());
    }
}
