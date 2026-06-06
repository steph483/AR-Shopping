"use strict";
/**
 * Specs Inc. 2026
 * Centralized logging utility for consistent log formatting across the package.
 * Provides tagged logging with optional debug mode toggling and beautifully formatted output.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
/**
 * Logger utility class for consistent, formatted logging across scripts
 */
class Logger {
    /**
     * Creates a new Logger instance
     * @param tag - The tag to prefix all log messages with
     * @param debugEnabled - Whether debug logging is enabled (default: true)
     * @param useColors - Whether to use colored output (default: true)
     */
    constructor(tag, debugEnabled = true, useColors = true) {
        // ANSI color codes for terminal output
        this.COLORS = {
            RESET: "\x1b[0m",
            BRIGHT: "\x1b[1m",
            DIM: "\x1b[2m",
            // Foreground colors
            BLACK: "\x1b[30m",
            RED: "\x1b[31m",
            GREEN: "\x1b[32m",
            YELLOW: "\x1b[33m",
            BLUE: "\x1b[34m",
            MAGENTA: "\x1b[35m",
            CYAN: "\x1b[36m",
            WHITE: "\x1b[37m",
            // Background colors
            BG_BLACK: "\x1b[40m",
            BG_RED: "\x1b[41m",
            BG_GREEN: "\x1b[42m",
            BG_YELLOW: "\x1b[43m",
            BG_BLUE: "\x1b[44m",
            BG_MAGENTA: "\x1b[45m",
            BG_CYAN: "\x1b[46m",
            BG_WHITE: "\x1b[47m",
        };
        this.tag = tag;
        this.debugEnabled = debugEnabled;
        this.useColors = useColors;
    }
    /**
     * Formats a message with optional color and styling
     * @param level - Log level string
     * @param message - The message content
     * @param color - ANSI color code (unused in Lens Studio, kept for API compatibility)
     * @returns Formatted message string
     */
    format(level, message, color) {
        const timestamp = new Date().toISOString().substr(11, 8);
        // Simple pipe-separated format for better readability in Lens Studio console
        return `${timestamp} | ${this.tag} | ${level} | ${message}`;
    }
    /**
     * Logs an informational message with nice formatting
     * @param message - The message to log
     */
    info(message) {
        const formatted = this.format("INFO", message, this.COLORS.GREEN);
        print(formatted);
    }
    /**
     * Logs a debug message (only if debug mode is enabled)
     * @param message - The message to log
     */
    debug(message) {
        if (this.debugEnabled) {
            const formatted = this.format("DEBUG", message, this.COLORS.BLUE);
            print(formatted);
        }
    }
    /**
     * Logs a warning message
     * @param message - The message to log
     */
    warn(message) {
        const formatted = this.format("WARN", message, this.COLORS.YELLOW);
        print(formatted);
    }
    /**
     * Logs an error message
     * @param message - The message to log
     */
    error(message) {
        const formatted = this.format("ERROR", message, this.COLORS.RED);
        print(formatted);
    }
    /**
     * Logs a success message
     * @param message - The message to log
     */
    success(message) {
        const formatted = this.format("SUCCESS", message, this.COLORS.GREEN + this.COLORS.BRIGHT);
        print(formatted);
    }
    /**
     * Logs a separator line for visual organization
     * @param char - Character to use for the line (default: "-")
     * @param length - Length of the separator (default: 80)
     */
    separator(char = "-", length = 80) {
        // Simple separator with pipes for cleaner console output
        print(`${"".padStart(length, char)}`);
    }
    /**
     * Logs a header message with surrounding separators
     * @param message - The header message
     */
    header(message) {
        this.separator("=", 80);
        print(`| ${message.toUpperCase()}`);
        this.separator("=", 80);
    }
    /**
     * Enables or disables debug logging
     * @param enabled - Whether debug logging should be enabled
     */
    setDebugEnabled(enabled) {
        this.debugEnabled = enabled;
    }
    /**
     * Enables or disables colored output
     * @param enabled - Whether colored output should be enabled
     */
    setColorsEnabled(enabled) {
        this.useColors = enabled;
    }
}
exports.Logger = Logger;
//# sourceMappingURL=Logger.js.map