const express = require('express');
const bodyParser = require('body-parser');
const koneksi = require('./config/database');
const app = express();
const PORT = process.env.PORT || 5000;

const multer = require('multer')
const path = require('path')
var cors = require('cors');
app.use(cors({
    origin: '*'
}));


// set body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// script upload

app.use(express.static("./public"))
 //! Use of Multer
var storage = multer.diskStorage({
    destination: (req, file, callBack) => {
        callBack(null, './public/images/')     // './public/images/' directory name where save the file
    },
    filename: (req, file, callBack) => {
        callBack(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
})
 
var upload = multer({
    storage: storage
});
 
// create data / insert data
app.post('/api/datakaryawan',upload.single('image'),(req, res) => {

    const data = { ...req.body };
    const idkaryawan = req.body.idkaryawan;
    const nama = req.body.nama;
    const tanggallahir = req.body.tanggallahir;
    const jeniskelamin = req.body.jeniskelamin;
    const alamat = req.body.alamat;
    const jabatan = req.body.jabatan;

    if (!req.file) {
        console.log("No file upload");
        const querySql = 'INSERT INTO datakaryawan (idkaryawan,nama,tanggallahir,jeniskelamin,alamat,jabatan) values (?,?,?,?,?,?);';
         
        // jalankan query
        koneksi.query(querySql,[ idkaryawan,nama, tanggallahir,jeniskelamin,alamat,jabatan], (err, rows, field) => {
            // error handling
            if (err) {
                return res.status(500).json({ message: 'Gagal insert data!', error: err });
            }
       
            // jika request berhasil
            res.status(201).json({ success: true, message: 'Berhasil insert data!' });
        });
    } else {
        console.log(req.file.filename)
        var imgsrc = 'http://localhost:5000/images/' + req.file.filename;
        const foto =   imgsrc;
    // buat variabel penampung data dan query sql
    const data = { ...req.body };
    const querySql = 'INSERT INTO datakaryawan (idkaryawan,nama,tanggallahir,jeniskelamin,alamat,jabatan,foto) values (?,?,?,?,?,?,?);';
 
// jalankan query
koneksi.query(querySql,[ idkaryawan,nama,tanggallahir,jeniskelamin,alamat,jabatan,foto], (err, rows, field) => {
    // error handling
    if (err) {
        return res.status(500).json({ message: 'Gagal insert data!', error: err });
    }

    // jika request berhasil
    res.status(201).json({ success: true, message: 'Berhasil insert data!' });
});
}
});

// read data / get data
app.get('/api/datakaryawan', (req, res) => {
    // buat query sql
    const querySql = 'SELECT * FROM datakaryawan';

    // jalankan query
    koneksi.query(querySql, (err, rows, field) => {
        // error handling
        if (err) {
            return res.status(500).json({ message: 'Ada kesalahan', error: err });
        }

        // jika request berhasil
        res.status(200).json({ success: true, data: rows });
    });
});

// update data
app.put('/api/datakaryawan/:idkaryawan', (req, res) => {
    // buat variabel penampung data dan query sql
    const data = { ...req.body };
    const querySearch = 'SELECT * FROM datakaryawan WHERE idkaryawan = ?';
    const idkaryawan = req.body.idkaryawan;
    const nama = req.body.nama;
    const tanggallahir = req.body.tanggallahir;
    const jeniskelamin = req.body.jeniskelamin;
    const alamat = req.body.alamat;
    const jabatan = req.body.jabatan;

    const queryUpdate = 'UPDATE datakaryawan SET nama=?,tanggallahir=?,jeniskelamin=?,alamat=?,jabatan=? WHERE idkaryawan = ?';

    // jalankan query untuk melakukan pencarian data
    koneksi.query(querySearch, req.params.idkaryawan, (err, rows, field) => {
        // error handling
        if (err) {
            return res.status(500).json({ message: 'Ada kesalahan', error: err });
        }

        // jika id yang dimasukkan sesuai dengan data yang ada di db
        if (rows.length) {
            // jalankan query update
            koneksi.query(queryUpdate, [nama,tanggallahir,jeniskelamin,alamat,jabatan, req.params.idkaryawan], (err, rows, field) => {
                // error handling
                if (err) {
                    return res.status(500).json({ message: 'Ada kesalahan', error: err });
                }

                // jika update berhasil
                res.status(200).json({ success: true, message: 'Berhasil update data!' });
            });
        } else {
            return res.status(404).json({ message: 'Data tidak ditemukan!', success: false });
        }
    });
});

// delete data
app.delete('/api/datakaryawan/:idkaryawan', (req, res) => {
    // buat query sql untuk mencari data dan hapus
    const querySearch = 'SELECT * FROM datakaryawan WHERE idkaryawan = ?';
    const queryDelete = 'DELETE FROM datakaryawan WHERE idkaryawan = ?';

    // jalankan query untuk melakukan pencarian data
    koneksi.query(querySearch, req.params.idkaryawan, (err, rows, field) => {
        // error handling
        if (err) {
            return res.status(500).json({ message: 'Ada kesalahan', error: err });
        }

        // jika id yang dimasukkan sesuai dengan data yang ada di db
        if (rows.length) {
            // jalankan query delete
            koneksi.query(queryDelete, req.params.idkaryawan, (err, rows, field) => {
                // error handling
                if (err) {
                    return res.status(500).json({ message: 'Ada kesalahan', error: err });
                }

                // jika delete berhasil
                res.status(200).json({ success: true, message: 'Berhasil hapus data!' });
            });
        } else {
            return res.status(404).json({ message: 'Data tidak ditemukan!', success: false });
        }
    });
});

// buat server nya
app.listen(PORT, () => console.log(`Server running at port: ${PORT}`));