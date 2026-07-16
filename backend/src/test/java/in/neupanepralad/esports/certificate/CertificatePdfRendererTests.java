package in.neupanepralad.esports.certificate;

import in.neupanepralad.esports.certificate.model.Certificate;
import in.neupanepralad.esports.certificate.model.CertificateType;
import in.neupanepralad.esports.certificate.service.CertificatePdfRenderer;
import in.neupanepralad.esports.tournament.model.Tournament;
import in.neupanepralad.esports.user.model.User;
import org.junit.jupiter.api.Test;

import java.nio.charset.StandardCharsets;

import static org.assertj.core.api.Assertions.assertThat;

class CertificatePdfRendererTests {

    @Test
    void rendererCreatesAValidPdfHeaderAndCrossReferenceTable() {
        User recipient = new User();
        recipient.setFullName("Champion Player");
        Tournament tournament = new Tournament();
        tournament.setName("Championship");
        Certificate certificate = new Certificate();
        certificate.setRecipient(recipient);
        certificate.setTournament(tournament);
        certificate.setType(CertificateType.WINNER);
        certificate.setTitle("Certificate of Victory");
        certificate.setSerialNumber("CERT-2026-TEST");
        certificate.setVerificationCode("verify-test");

        String pdf = new String(
                new CertificatePdfRenderer().render(certificate),
                StandardCharsets.US_ASCII
        );

        assertThat(pdf).startsWith("%PDF-1.4").contains("xref").contains("%%EOF");
    }
}
