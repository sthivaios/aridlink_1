# AridLink 1 Firmware Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

**This changelog covers the AridLink 1 firmware only. ALIM and the hardware are versioned separately.**

---

## [Unreleased]

## [0.1.0] - 2026-10-02

### Changed
- Firmware now fetches the schedule over HTTPS from AridLink Irrigation Manager (ALIM) instead of AWS IoT over MQTT

### Removed
- AWS IoT support