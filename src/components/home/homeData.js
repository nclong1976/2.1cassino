// Mock data source for the Home page (games, announcements, categories).

import g1Img from "@/assets/images/regenerated_image_1786211623879.png";
import g2Img from "@/assets/images/regenerated_image_1786211622696.png";
import g3Img from "@/assets/images/regenerated_image_1786211153625.png";
import g4Img from "@/assets/images/regenerated_image_1786211626625.png";
import g5Img from "@/assets/images/regenerated_image_1786211625257.png";
import g6Img from "@/assets/images/regenerated_image_1786211621456.png";
import g7Img from "@/assets/images/regenerated_image_1786211632612.png";
import g8Img from "@/assets/images/regenerated_image_1786211628967.png";
import g9Img from "@/assets/images/regenerated_image_1786211627904.png";

export const CATEGORIES = [
  { key: "all", labelKey: "cat_all" },
  { key: "lucky28", labelKey: "cat_lucky28" },
  { key: "xoso", labelKey: "cat_xoso" },
  { key: "pk10", labelKey: "cat_pk10" },
  { key: "slot", labelKey: "cat_slot" },
  { key: "casino", labelKey: "cat_casino" },
];

export const GAMES = [
  { id: "g1", gameId: "may-man-28", title: "", category: "lucky28", badge: "hot", status: "active",
    bg: g1Img,
    titleClass: "text-figma-12 font-bold font-figma-inter leading-figma-17 text-[#ccb2eb]" },
  { id: "g2", gameId: "may-man-28", title: "", category: "lucky28", badge: "new", status: "active",
    bg: g2Img,
    titleClass: "text-figma-11 font-normal font-paragraph leading-figma-31 text-[#d3bced]" },
  { id: "g3", gameId: "may-man-28", title: "", category: "lucky28", badge: "hot", status: "active",
    bg: g3Img,
    titleClass: "text-figma-12 font-bold font-figma-inter leading-figma-17 text-[#d5bdec]" },
  { id: "g4", gameId: "xoso", title: "", category: "xoso", status: "active",
    bg: g4Img,
    titleClass: "text-figma-14 font-bold font-figma-news-cycle leading-figma-16 text-[#d2baec]" },
  { id: "g5", gameId: "xoso", title: "", category: "xoso", status: "active",
    bg: g5Img,
    titleClass: "text-figma-12 font-bold font-figma-arimo leading-figma-17 text-[#cbb2ea]" },
  { id: "g6", gameId: "xoso", title: "", category: "xoso", status: "maintenance",
    bg: g6Img,
    titleClass: "text-figma-11 font-bold font-figma-arimo leading-figma-14 text-[#d1b8e9]" },
  { id: "g7", gameId: "pk10", title: "", category: "pk10", badge: "hot", status: "active",
    bg: g7Img,
    overlay: { src: "https://media.base44.com/images/public/6a729d033f9d0f63f381a6c6/b19be242e_292e7a944_5952b8f1ffb770a13601dc2d2c3e286f08149e5d.png", cls: "absolute top-[14px] left-[21px] w-[90px] h-[75px] object-contain z-10" },
    titleClass: "text-figma-13 font-bold font-figma-manrope leading-figma-15 text-[#c9afe8]" },
  { id: "g8", gameId: "pk10", title: "", category: "pk10", status: "active",
    bg: g8Img,
    overlay: { src: "https://media.base44.com/images/public/6a729d033f9d0f63f381a6c6/86af2d866_d6b9a21b7_937168ca48d3af77bc7be2801bd865606032ef8f.png", cls: "absolute top-[20px] left-[15px] w-[102px] h-[74px] object-contain z-10" },
    titleClass: "text-figma-12 font-bold font-figma-arimo leading-figma-17 text-[#d9c5ee]" },
  { id: "g9", gameId: "pk10", title: "", category: "pk10", status: "active",
    bg: g9Img,
    titleClass: "text-figma-12 font-bold font-figma-arimo leading-figma-16 text-[#d6c3ec]" },

];

export const getGameById = (id) => GAMES.find((g) => g.id === id);

export const ANNOUNCEMENTS = [
  { id: "a1", title: "★ NguyenHa thắng $5,200,000 USD tại May mắn 28 Hàn Quốc!", detail: "Vào lúc 09:32 sáng nay, người chơi NguyenHa đã trúng giải đặc biệt tại phòng May mắn 28 Hàn Quốc với tổng thưởng $5,200,000 USD. Chúc mừng người chơi may mắn!" },
  { id: "a2", title: "Sự kiện: Nạp lần đầu tặng 50% đến $2,000,000 USD", detail: "Từ 01/08 - 15/08, thành viên mới nạp lần đầu sẽ nhận thưởng 50% giá trị nạp, tối đa $2,000,000 USD. Áp dụng cho tất cả phương thức thanh toán." },
  { id: "a3", title: "Bảo trì hệ thống Xổ số Đài Loan 02:00 - 03:00 ngày 06/08", detail: "Hệ thống Xổ số Đài Loan sẽ tạm bảo trì để nâng cấp từ 02:00 đến 03:00 ngày 06/08/2026. Các cược đang chờ sẽ được giữ nguyên. Xin lỗi vì sự bất tiện." },
];