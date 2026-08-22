package in.neupanepralad.esports.discovery.controller;

import in.neupanepralad.esports.common.response.APIResponse;
import in.neupanepralad.esports.discovery.dto.DiscoveryHomeResponse;
import in.neupanepralad.esports.discovery.service.DiscoveryService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/discovery")
@RequiredArgsConstructor
public class DiscoveryController {

    private final DiscoveryService discoveryService;

    @GetMapping("/home")
    public APIResponse<DiscoveryHomeResponse> home() {
        return APIResponse.success("Discovery home retrieved", discoveryService.home());
    }
}