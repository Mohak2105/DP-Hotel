package com.dphotel.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class CashfreeConfig {

    @Value("${cashfree.app-id:}")
    private String appId;

    @Value("${cashfree.secret-key:}")
    private String secretKey;

    @Value("${cashfree.environment:sandbox}")
    private String environment;

    @Value("${cashfree.api-version:2023-08-01}")
    private String apiVersion;

    public String getAppId() {
        return appId;
    }

    public String getSecretKey() {
        return secretKey;
    }

    public String getEnvironment() {
        return environment;
    }

    public String getApiVersion() {
        return apiVersion;
    }

    public String getBaseUrl() {
        if ("production".equalsIgnoreCase(environment) || "prod".equalsIgnoreCase(environment)) {
            return "https://api.cashfree.com/pg";
        }
        return "https://sandbox.cashfree.com/pg";
    }

    public boolean isConfigured() {
        return appId != null && !appId.trim().isEmpty() && secretKey != null && !secretKey.trim().isEmpty();
    }
}
