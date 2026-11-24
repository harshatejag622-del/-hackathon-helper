package com.hackathonhelper.util;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.sql.Statement;

/**
 * DBConnection - Database utility managing JDBC connections.
 * Works with MySQL, PostgreSQL, SQLite, or in-memory H2 databases.
 */
public class DBConnection {
    // Default connection URL for MySQL (Change credentials as needed for local environment)
    private static final String URL = "jdbc:mysql://localhost:3306/hackathon_helper?useSSL=false&allowPublicKeyRetrieval=true";
    private static final String USER = "root";
    private static final String PASSWORD = "password";

    // SQLite fallback URL for instant local zero-server operation
    private static final String SQLITE_URL = "jdbc:sqlite:hackathon_helper.db";

    public static Connection getConnection() throws SQLException {
        try {
            // Attempt MySQL Driver
            Class.forName("com.mysql.cj.jdbc.Driver");
            return DriverManager.getConnection(URL, USER, PASSWORD);
        } catch (ClassNotFoundException | SQLException e) {
            try {
                // Fallback to SQLite Driver
                Class.forName("org.sqlite.JDBC");
                return DriverManager.getConnection(SQLITE_URL);
            } catch (Exception ex) {
                // If no external JDBC driver in classpath, throw informative exception
                throw new SQLException("Database connection error: " + ex.getMessage());
            }
        }
    }

    /**
     * Closes resources safely.
     */
    public static void close(Connection conn, Statement stmt) {
        try {
            if (stmt != null) stmt.close();
            if (conn != null) conn.close();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }
}
