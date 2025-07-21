// ? แปลงเป็นตัวพิมพ์เล็ก (Lowercase):
// ? ตัดข้อความเป็นคำ ๆ
// ? กำจัดอักษรพิเศษและเครื่องหมายเว้นวรรค
// ? กรองคำที่เป็น stop words
// ? นับความถี่ของคำ
// ? หาคำที่มีความถี่สูงสุด

function findMostFrequentWord(messages, stopWord) {
  if (!messages || messages.length === 0) {
    return "";
  }

  let words = messages.map((message) => message.split(/\s+/));
  // ใช้ concat และ spread operator กระจายคำใน Array และนำมารวมกันเป็น 1D Array
  words = [].concat(...words);
  console.log(words);

  // แปลงข้อความเป็นตัวพิมพ์เล็กและแยกคำออกจากกัน
  words = words.map((message) => message.toLowerCase());
  console.log(words);

  // ตัดคำที่เป็นเครื่องหมายวรรคตอนออก
  const cleanWords = words.map((word) => word.replace(/^[.,!?;:()"'\-]+|[.,!?;:()"'\-]+$/g, ""));
  console.log(cleanWords);

  // ทำให้ stop words เป็นตัวพิมพ์เล็ก
  // ใช้ Set เพื่อเพิ่มความเร็วในการค้นหาคำ
  const stopWords = new Set(stopWord.map((word) => word.toLowerCase()));
  console.log(stopWords);

  // กรองคำที่เป็น stop words
  for (let i = 0; i < cleanWords.length; i++) {
    // ใช้ has() ของ Set เพื่อตรวจสอบว่าคำอยู่ใน stopWords หรือไม่
    // ถ้าอยู่ใน stopWords จะลบคำออกจาก cleanWords
    if (stopWords.has(cleanWords[i])) {
      cleanWords.splice(i, 1);
      i--; // ลดค่า i ลงเพื่อไม่ให้ข้ามคำถัดไป
    }
  }
  console.log(cleanWords);

  // นับความถี่ของคำโดยใช้ Object
  const wordCount = {};
  for (const word of cleanWords) {
    if (wordCount[word] === undefined) {
      wordCount[word] = 1;
    } else {
      wordCount[word]++;
    }
  }
  // console.log("Word Count:", wordCount);

  // หาคำที่มีความถี่สูงสุด
  let mostFrequentWord = "";
  // จำนวนสูงสุดของคำ
  let maxCount = 0;

  // วนลูปผ่าน wordCount เพื่อหา value สูงสุด
  for (let word in wordCount) {
    console.log(wordCount[word]);
    if (wordCount[word] > maxCount) {
      maxCount = wordCount[word];
      mostFrequentWord = word;
    }
  }
  console.log("Most Frequent Word:", mostFrequentWord);

  return mostFrequentWord || "";
}

const messages1 = ["Hello world!", "Hello everyone", "The world is beautiful"];
const stopWords1 = ["the", "is", "a", "everyone"];
console.log(findMostFrequentWord(messages1, stopWords1)); // คาดหวัง: "hello" หรือ "world"

const messages2 = ["a b c", "a b", "a"];
const stopWords2 = [];
console.log(findMostFrequentWord(messages2, stopWords2)); // คาดหวัง: "a"
