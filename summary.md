# Live Order Monitoring System

โปรเจกต์นี้เป็นระบบติดตามออเดอร์แบบเรียลไทม์สำหรับธุรกิจ E-commerce หรือ Logistics โดยมีโครงสร้างแบบ Microservices และใช้ Docker Compose ในการจัดการทุก service
 
## ข้อกำหนดทั่วไป
- ใช้ Docker Compose ในการจัดการ service ทั้งหมด
- สร้างไฟล์ .env.example สำหรับทุก service และห้าม commit ข้อมูลที่เป็นความลับ (secrets)
- แนบไฟล์ README.md ที่สมบูรณ์ ซึ่งประกอบด้วย:
    - ขั้นตอนการติดตั้ง (Setup instructions)
    - แผนภาพสถาปัตยกรรม (Architecture diagram)
    - หน้าที่ของแต่ละ Service (Service responsibilities)
    - คำอธิบายการใช้งาน WebSocket (WebSocket use case explanation)
    - URL สำหรับ Swagger/Postman (สำหรับ Local)

## รายละเอียดโปรเจกต์
สร้างแดชบอร์ดสำหรับติดตามออเดอร์ที่เข้ามาแบบเรียลไทม์ (Live Order Monitoring Dashboard) เพื่อให้พนักงานภายใน (Internal staff) ใช้ติดตามออเดอร์ (ตัวอย่างเช่น สำหรับธุรกิจ E-commerce หรือ Logistics)

## โครงสร้างโปรเจกต์
- frontend/
- services/ (แต่ละ microservice แยกโฟลเดอร์)
- gateway/ (API Gateway หรือ BFF)
- other-services/ (PostgreSQL, Redis ฯลฯ)

## เทคโนโลยีหลัก
- Backend ทุกส่วนใช้ NestJS (orders-service, users-service, gateway)
- Frontend: Next.js, React Query, Tailwind, Socket.IO-client
- Gateway API: NestJS (BFF + WebSocket hub)
- Microservices: NestJS (`orders`, `users`)
- Realtime: WebSocket (NestJS Gateway หรือ Socket.IO)
- Database: PostgreSQL + Redis (pub/sub)
- Auth: JWT (API Gateway จัดการ)
- DevOps: Docker Compose

## Service Overview
- **orders-service**: สร้าง/อัปเดต/ลบออเดอร์, ส่ง event ไป Redis, เก็บข้อมูลใน PostgreSQL
- **users-service**: จัดการผู้ใช้, ล็อกอิน, บทบาท, สร้าง JWT และ RBAC
- **gateway**: REST + WebSocket API, Auth middleware, subscribe event จาก Redis และ broadcast ไปยัง client

## WebSocket Flow
1. ลูกค้าสร้างออเดอร์ → orders-service ประมวลผล
2. orders-service ส่ง event ผ่าน Redis Pub/Sub
3. gateway ดักฟัง event และ broadcast ผ่าน WebSocket ไปยังแดชบอร์ดพนักงาน
4. แดชบอร์ดอัปเดตทันทีโดยไม่ต้องรีเฟรช

## ฟีเจอร์ฝั่ง Frontend
- หน้าล็อกอินสำหรับ Admin (JWT)
- แดชบอร์ดแสดงออเดอร์แบบเรียลไทม์สำหรับพนักงาน
- ฟังก์ชันกรองออเดอร์ตามสถานะ
- ปุ่มอัปเดตเพื่อมอบหมายออเดอร์

## เกณฑ์การประเมิน
- อัปเดตแบบเรียลไทม์ผ่าน WebSocket
- สถาปัตยกรรมแยกตาม service
- JWT + RBAC
- เอกสารประกอบ (Swagger/Postman)
- Docker Compose
- ฐานข้อมูล normalized + relations
- Redis pub/sub หรือ MQ
- การจัดการข้อผิดพลาดที่ปลอดภัย
- (ไม่บังคับ) การทดสอบและ CI/CD


## Document Front-end
https://nextjs.org/docs