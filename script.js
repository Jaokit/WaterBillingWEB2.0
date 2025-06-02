const form = document.getElementById("billForm");
const billPreview = document.getElementById("billPreview");
const billDate = document.getElementById("billDate");
const historyModal = document.getElementById("historyModal");
const historyList = document.getElementById("historyList");

const STORAGE_KEY = "waterBillHistory";

const today = new Date();
billDate.value = today.toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' });

document.getElementById("fetchMeter").onclick = () => {
  const houseNumber = document.getElementById("houseNumber").value;
  const history = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  const lastEntry = [...history].reverse().find(entry => entry.houseNumber === houseNumber);
  if (lastEntry) {
    document.getElementById("prevMeter").value = lastEntry.currMeter;
  } else {
    alert("ไม่พบข้อมูลเก่า");
  }
};

form.onsubmit = (e) => {
  e.preventDefault();

  const houseNumber = document.getElementById("houseNumber").value;
  const prevMeter = +document.getElementById("prevMeter").value;
  const currMeter = +document.getElementById("currMeter").value;
  const other = +document.getElementById("otherCharges").value;
  const used = currMeter - prevMeter;
  const total = used * 6 + other;

  const html = `
    <h2 style="text-align: center;">บิลค่าน้ำบ้านสวยบางเลย</h2>
    <p>วันที่ออกบิล: ${billDate.value}</p>
    <p><strong>บ้านเลขที่: ${houseNumber}</strong></p>
    <p>เลขมิเตอร์ครั้งก่อน: ${prevMeter}</p>
    <p>เลขมิเตอร์ครั้งนี้: ${currMeter}</p>
    <p>ใช้น้ำทั้งหมด: ${used} หน่วย</p>
    <p>ราคาต่อหน่วย: 6 บาท</p>
    <p>ค่าบริการอื่น ๆ: ${other} บาท</p>
    <h3>รวมค่าใช้จ่าย: ${total} บาท</h3>
    <p style="text-align: center; margin-top: 20px;">สแกนเพื่อชำระเงิน</p>
    <img src="images/qrcode.jpg" alt="QR PromptPay" class="qr-image" />
  `;

  billPreview.innerHTML = html;
  billPreview.classList.remove("hidden");

  const history = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  history.push({
    date: billDate.value,
    houseNumber,
    prevMeter,
    currMeter,
    other,
    total
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
};

document.getElementById("printBill").onclick = () => {
  window.print();
};

document.getElementById("exportData").onclick = () => {
  const history = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

  if (history.length === 0) {
    alert("ยังไม่มีข้อมูลบันทึก");
    return;
  }

  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear() + 543;

  const monthNames = [
    "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
    "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
  ];
  const thaiMonthName = monthNames[month];
  const fileName = `บิลค่าน้ำเดือน${thaiMonthName}${year}.txt`;

  const filtered = history.filter(h => {
    if (!h.date) return false;
    const parts = h.date.split(" ");
    return parts[1] === thaiMonthName && parts[2] === year.toString();
  });

  if (filtered.length === 0) {
    alert(`ยังไม่มีบิลในเดือน ${thaiMonthName} ${year}`);
    return;
  }

  const sorted = [...filtered].sort((a, b) => new Date(b.date) - new Date(a.date));

  const lines = sorted.map(h =>
    `วันที่ ${h.date} | บ้านเลขที่ ${h.houseNumber} | เลขมิเตอร์ครั้งก่อน ${h.prevMeter} | เลขมิเตอร์ครั้งนี้ ${h.currMeter} | ค่าบริการอื่น ๆ ${h.other} บาท | รวม ${h.total ?? "-"} บาท`
  );

  const content = lines.join('\n');

  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.download = fileName;
  link.href = url;
  link.click();
};

document.getElementById("viewHistory").onclick = () => {
  const history = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

  if (history.length === 0) {
    historyList.innerHTML = "<li>ยังไม่มีข้อมูลบันทึก</li>";
  } else {
    const sorted = [...history].sort((a, b) => new Date(b.date) - new Date(a.date));

    historyList.innerHTML = sorted.map(h =>
      `<li>
        วันที่ ${h.date} | บ้านเลขที่ ${h.houseNumber} | เลขมิเตอร์ครั้งก่อน ${h.prevMeter} | เลขมิเตอร์ครั้งนี้ ${h.currMeter} | ค่าบริการอื่น ๆ ${h.other} บาท | รวม ${h.total ?? "-"} บาท
      </li>`
    ).join("");
  }

  historyModal.classList.remove("hidden");
};

function closeHistory() {
  historyModal.classList.add("hidden");
}