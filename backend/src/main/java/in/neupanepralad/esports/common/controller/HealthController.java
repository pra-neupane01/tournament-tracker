package in.neupanepralad.esports.common.controller;

import in.neupanepralad.esports.common.response.APIResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/health")
public class HealthController {

    @GetMapping
    public ResponseEntity<APIResponse<Map<String, String>>> healthCheck() {
        Map<String, String> data = Map.of(
                "status", "UP",
                "application", "esports-management-system"
        );
        return ResponseEntity.ok(APIResponse.success("Esports Management System backend is running", data));
    }
}
