
// const r = require("tesseract.js");

// r.recognize(
//     "../id_sample.jpg",
//     "eng",
//     {
//         logger: e => console.log(e)
//     }
// ).then(({ data: { text } }) => {
//     console.log(text);
// });


// const Tesseract = require("tesseract.js");

// async function scanImage() {
//     const worker = await Tesseract.createWorker("eng");

//     const result = await worker.recognize("./id_sample.jpg");

//     console.log(result.data.text);

//     await worker.terminate();
// }

// scanImage();

const conn = require("./conn")
const Tesseract = require("tesseract.js");

const id_text = /\b\d{2}-\d{4}-\d{6}\b/;
async function scanImage() {
    const worker = await Tesseract.createWorker("eng");

    await worker.setParameters({
        tessedit_char_whitelist: "0123456789-"
    });
    const result = await worker.recognize("../id_sample.jpg")
    const id = result.data.text.match(id_text);

    if (id) {
        const student_id = id[0]
        conn.query("SELECT * FROM students WHERE student_id = ?", [student_id], (err, results) => {
                if (err) {
                    console.log("Database error:", err);
                    return;
                }
                if (results.length > 0) {
                    console.log(results[0]);
                } else {
                    console.log("ID not found in database.");
                }
            }
        );
    }else{
        console.log("Failure")
    }

    

    await worker.terminate();
}
scanImage();
    

