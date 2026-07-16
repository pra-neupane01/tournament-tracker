package in.neupanepralad.esports.certificate.service;

import in.neupanepralad.esports.certificate.model.Certificate;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

@Service
public class CertificatePdfRenderer {

    public byte[] render(Certificate certificate) {
        String content = """
                BT
                /F1 28 Tf
                110 680 Td
                (%s) Tj
                /F1 16 Tf
                0 -80 Td
                (Presented to) Tj
                /F1 24 Tf
                0 -45 Td
                (%s) Tj
                /F1 14 Tf
                0 -55 Td
                (For %s in %s) Tj
                0 -35 Td
                (Serial: %s) Tj
                0 -25 Td
                (Verify: %s) Tj
                ET
                """.formatted(
                escape(certificate.getTitle()),
                escape(certificate.getRecipient().getFullName()),
                escape(certificate.getType().name().replace('_', ' ')),
                escape(certificate.getTournament().getName()),
                escape(certificate.getSerialNumber()),
                escape(certificate.getVerificationCode())
        );
        return createPdf(content);
    }

    private byte[] createPdf(String content) {
        List<byte[]> objects = List.of(
                bytes("<< /Type /Catalog /Pages 2 0 R >>"),
                bytes("<< /Type /Pages /Kids [3 0 R] /Count 1 >>"),
                bytes("""
                        << /Type /Page /Parent 2 0 R
                           /MediaBox [0 0 612 792]
                           /Resources << /Font << /F1 5 0 R >> >>
                           /Contents 4 0 R >>
                        """),
                bytes("<< /Length " + bytes(content).length + " >>\nstream\n"
                        + content + "\nendstream"),
                bytes("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>")
        );
        ByteArrayOutputStream output = new ByteArrayOutputStream();
        write(output, "%PDF-1.4\n");
        List<Integer> offsets = new ArrayList<>();
        for (int index = 0; index < objects.size(); index++) {
            offsets.add(output.size());
            write(output, (index + 1) + " 0 obj\n");
            output.writeBytes(objects.get(index));
            write(output, "\nendobj\n");
        }
        int xref = output.size();
        write(output, "xref\n0 " + (objects.size() + 1) + "\n");
        write(output, "0000000000 65535 f \n");
        offsets.forEach(offset -> write(output, "%010d 00000 n \n".formatted(offset)));
        write(output, "trailer\n<< /Size " + (objects.size() + 1)
                + " /Root 1 0 R >>\nstartxref\n" + xref + "\n%%EOF");
        return output.toByteArray();
    }

    private String escape(String value) {
        return value.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)");
    }

    private byte[] bytes(String value) {
        return value.getBytes(StandardCharsets.US_ASCII);
    }

    private void write(ByteArrayOutputStream output, String value) {
        output.writeBytes(bytes(value));
    }
}
