package in.neupanepralad.esports.result.dto;

import in.neupanepralad.esports.result.model.ResultMetric;

import java.math.BigDecimal;

public record ResultMetricResponse(
        String metricKey,
        BigDecimal value,
        BigDecimal awardedPoints
) {
    public static ResultMetricResponse from(ResultMetric metric) {
        return new ResultMetricResponse(
                metric.getMetricKey(),
                metric.getMetricValue(),
                metric.getAwardedPoints()
        );
    }
}
