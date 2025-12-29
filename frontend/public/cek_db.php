<?php
// File ini untuk mengecek koneksi database secara manual
$servername = "localhost";
$username = "prow9975_adminjates_db";
$password = "jates1110";
$dbname = "prow9975_jates9_db";

// Coba koneksi
$conn = new mysqli($servername, $username, $password, $dbname);

// Cek error
if ($conn->connect_error) {
    die("❌ KONEKSI GAGAL: " . $conn->connect_error);
}
echo "✅ KONEKSI SUKSES! <br>";
echo "Database '$dbname' berhasil terhubung dengan user '$username'.";

// Tes Query Sederhana (Opsional)
$sql = "SHOW TABLES";
$result = $conn->query($sql);
if ($result->num_rows > 0) {
    echo "<br><br>Daftar Tabel yang ditemukan:<br>";
    while($row = $result->fetch_assoc()) {
        echo "- " . $row["Tables_in_" . $dbname] . "<br>";
    }
} else {
    echo "<br><br>⚠️ Koneksi sukses, tapi belum ada tabel di database.";
}
$conn->close();
?>
