downloadPDF.onclick = async () => {
    const fd = new FormData();
    const abcd = input.value;
    const ly = abcd2ly(abcd);
    fd.append("code", ly);
    const response = await fetch("generatepdf.php", {
        method: 'post',
        type: 'application/pdf',
        body: fd
    });
    if (response.ok) {
        const b = await response.blob();
        const fileURL = URL.createObjectURL(b);

        const a = document.createElement("a");
        a.href = URL.createObjectURL(b);
        a.setAttribute("download", "output.pdf");
        a.click();

    }
}


