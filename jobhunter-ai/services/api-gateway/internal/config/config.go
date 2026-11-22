package config

import (
	"fmt"
	"os"
	"strconv"
)

type Config struct {
	AppEnv             string
	AppPort            string
	AppVersion         string
	JWTSecret          string
	JWTExpirationHours int
	PostgresHost       string
	PostgresPort       string
	PostgresDB         string
	PostgresUser       string
	PostgresPassword   string
	RedisHost          string
	RedisPort          string
	AIServiceURL       string
}

func Load() *Config {
	return &Config{
		AppEnv:             getEnv("APP_ENV", "development"),
		AppPort:            getEnv("APP_PORT", "8080"),
		AppVersion:         getEnv("APP_VERSION", "0.1.0"),
		JWTSecret:          getEnv("JWT_SECRET", "change-me-in-production"),
		JWTExpirationHours: getEnvInt("JWT_EXPIRATION_HOURS", 24),
		PostgresHost:       getEnv("POSTGRES_HOST", "localhost"),
		PostgresPort:       getEnv("POSTGRES_PORT", "5432"),
		PostgresDB:         getEnv("POSTGRES_DB", "jobhunter"),
		PostgresUser:       getEnv("POSTGRES_USER", "jobhunter"),
		PostgresPassword:   getEnv("POSTGRES_PASSWORD", "change_me"),
		RedisHost:          getEnv("REDIS_HOST", "localhost"),
		RedisPort:          getEnv("REDIS_PORT", "6379"),
		AIServiceURL:       getEnv("AI_SERVICE_URL", "http://localhost:8000"),
	}
}

func (c *Config) PostgresDSN() string {
	return fmt.Sprintf(
		"postgres://%s:%s@%s:%s/%s?sslmode=disable",
		c.PostgresUser, c.PostgresPassword,
		c.PostgresHost, c.PostgresPort, c.PostgresDB,
	)
}

func (c *Config) RedisAddr() string {
	return fmt.Sprintf("%s:%s", c.RedisHost, c.RedisPort)
}

func getEnv(key, fallback string) string {
	if val, ok := os.LookupEnv(key); ok {
		return val
	}
	return fallback
}

func getEnvInt(key string, fallback int) int {
	if val, ok := os.LookupEnv(key); ok {
		if n, err := strconv.Atoi(val); err == nil {
			return n
		}
	}
	return fallback
}