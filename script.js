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
  const last = [...history].reverse().find(e => e.houseNumber === houseNumber);
  if (last) {
    document.getElementById("prevMeter").value = last.currMeter;
  } else {
    alert("ไม่พบข้อมูลเก่า");
  }
};

form.onsubmit = (e) => {
  e.preventDefault();

  const houseNumber = document.getElementById("houseNumber").value;
  const prev = +document.getElementById("prevMeter").value;
  const curr = +document.getElementById("currMeter").value;
  const other = +document.getElementById("otherCharges").value;
  const used = curr - prev;
  const total = used * 6 + other;

  billPreview.innerHTML = `
    <h2 style="text-align: center;">บิลค่าน้ำบ้านสวยบางเลน</h2>
    <p>วันที่ออกบิล: ${billDate.value}</p>
    <p><strong>บ้านเลขที่: ${houseNumber}</strong></p>
    <p>เลขมิเตอร์ครั้งก่อน: ${prev}</p>
    <p>เลขมิเตอร์ครั้งนี้: ${curr}</p>
    <p>ใช้น้ำทั้งหมด: ${used} หน่วย</p>
    <p>ราคาต่อหน่วย: 6 บาท</p>
    <p>ค่าบริการอื่น ๆ: ${other} บาท</p>
    <h3>รวมค่าใช้จ่าย: ${total} บาท</h3>
    <p style="text-align: center; margin-top: 20px;">สแกนเพื่อชำระเงิน</p>
    <img src="images/qrcode.jpg" alt="QR PromptPay" class="qr-image" />
    <p style="text-align: center; margin-top: 8px; line-height: 1.4;">
      แอดไลน์ 093-4935691<br>
      โอนแล้วรบกวนส่งสลิปผ่านไลน์ด้วยค่ะ
    </p>
  `;

  billPreview.classList.remove("hidden");
  setTimeout(() => billPreview.classList.add("show"), 10);

  const history = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  history.push({ date: billDate.value, houseNumber, prevMeter: prev, currMeter: curr, other, total });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
};

document.getElementById("printBill").onclick = () => window.print();

document.getElementById("exportData").onclick = () => {
  const history = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  if (history.length === 0) return alert("ยังไม่มีข้อมูลบันทึก");

  const now = new Date();
  const monthNames = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
                      "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];
  const thaiMonth = monthNames[now.getMonth()];
  const year = now.getFullYear() + 543;
  const fileName = `บิลค่าน้ำเดือน${thaiMonth}${year}.txt`;

  const filtered = history.filter(h => {
    const [day, m, y] = h.date.split(" ");
    return m === thaiMonth && y === year.toString();
  });

  if (filtered.length === 0) return alert(`ยังไม่มีบิลในเดือน ${thaiMonth} ${year}`);

  const lines = filtered.map(h =>
    `วันที่ ${h.date} | บ้านเลขที่ ${h.houseNumber} | เลขมิเตอร์ครั้งก่อน ${h.prevMeter} | เลขมิเตอร์ครั้งนี้ ${h.currMeter} | ค่าบริการอื่น ๆ ${h.other} บาท | รวม ${h.total} บาท`
  );

  const blob = new Blob([lines.join('\n')], { type: "text/plain" });
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
      `<li>วันที่ ${h.date} | บ้านเลขที่ ${h.houseNumber} | เลขมิเตอร์ครั้งก่อน ${h.prevMeter} | เลขมิเตอร์ครั้งนี้ ${h.currMeter} | ค่าบริการอื่น ๆ ${h.other} บาท | รวม ${h.total} บาท</li>`
    ).join("");
  }
  historyModal.classList.remove("hidden");
};

function closeHistory() {
  historyModal.classList.add("hidden");
}

document.getElementById("clearData").onclick = () => {
  if (confirm("คุณแน่ใจหรือไม่ว่าต้องการล้างข้อมูลทั้งหมด?")) {
    localStorage.removeItem("waterBillHistory");
    alert("ลบข้อมูลเรียบร้อยแล้ว");
  }
};