package main

import "time"

// GlobalStatus represents the possible values for globalstatus
type GlobalStatus int

// GlobalStatus constants
const (
	GlobalStatusActive GlobalStatus = iota
	GlobalStatusInactive
	GlobalStatusArchived
)

// String returns the string representation of GlobalStatus
func (e GlobalStatus) String() string {
	switch e {
	case GlobalStatusActive:
		return "Active"
	case GlobalStatusInactive:
		return "Inactive"
	case GlobalStatusArchived:
		return "Archived"
	default:
		return "Unknown"
	}
}

// GlobalConfig represents a globalconfig entity
type GlobalConfig struct {
	Version string `json:"version"`
	Environment string `json:"environment"`
	Status GlobalStatus `json:"status"`
}

// NewGlobalConfig creates a new GlobalConfig instance
func NewGlobalConfig(version string, environment string, status GlobalStatus) *GlobalConfig {
	return &GlobalConfig{
		Version: version,
		Environment: environment,
		Status: status,
	}
}

