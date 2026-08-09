// Centralized Banner Store: manages single/multiple image or video banners
// Provides real-time synchronization across client and admin components.
import JSZip from "jszip";
import promoBannerImg from "@/assets/banner_khuyen_mai.jpg";

const STORAGE_KEY = "sands_banner_config";

export const PROMO_BANNER_URL = promoBannerImg;

export const PRESET_BANNERS = [
  {
    name: "Ảnh Khuyến Mãi Tri Ân Đặc Biệt MBS",
    type: "image",
    url: promoBannerImg,
    poster: "",
    title: "KHUYẾN MÃI TRI ÂN ĐẶC BIỆT",
    subtitle: "Marina Bay Sands MBS - Thưởng tích lũy lên tới 588.888$",
    badge: "ĐẶC BIỆT 🎁",
    objectFit: "cover"
  },
  {
    name: "Video Sands Casino MP4 (Gốc)",
    type: "video",
    url: "https://media.base44.com/videos/public/6a729d033f9d0f63f381a6c6/ac9c0fbcd_6faa31b965e5d1deaeb62d0f29225b5b1.mp4",
    poster: "https://media.base44.com/images/public/6a729d033f9d0f63f381a6c6/e57f331cd_708f7e507_e87283081c2ffaf4802a737a4f6e0a1d686d3b3c.png",
    title: "Sands Club Live Casino",
    subtitle: "Đỉnh cao cá cược trực tuyến 24/7",
    badge: "HOT 💥",
    objectFit: "cover"
  },
  {
    name: "Ảnh Khuyến Mãi Tải App / Nạp Thưởng",
    type: "image",
    url: "https://media.base44.com/images/public/6a729d033f9d0f63f381a6c6/51180f3b5_b60421ada_4b68ef08ef88c5e8b3877cb04357aa802c84a60d.png",
    poster: "",
    title: "Thưởng Nạp Lần Đầu 100%",
    subtitle: "Đăng ký nhận ngay quà tặng chào mừng VIP",
    badge: "KHUYẾN MÃI 🎁",
    objectFit: "cover"
  },
  {
    name: "Video Vòng Quay Roulette Thượng Lưu",
    type: "video",
    url: "https://assets.mixkit.co/videos/preview/mixkit-roulette-wheel-spinning-in-a-casino-41584-large.mp4",
    poster: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=800&auto=format&fit=crop&q=80",
    title: "Sảnh Roulette Đội Ngũ Dealer Trực Tiếp",
    subtitle: "Trải nghiệm chân thực như tại Las Vegas",
    badge: "LIVE 🎲",
    objectFit: "cover"
  },
  {
    name: "Ảnh Marina Bay Sands Đẳng Cấp 5 Sao",
    type: "image",
    url: "https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=1000&auto=format&fit=crop&q=80",
    poster: "",
    title: "Sands Club VIP Lounge",
    subtitle: "Đội ngũ chăm sóc khách hàng 24/7 chuyên nghiệp",
    badge: "VIP 👑",
    objectFit: "cover"
  }
];

export const DEFAULT_BANNER_CONFIG = {
  enableCarousel: true,
  autoplayInterval: 6000,
  bannerHeight: "180px",
  objectFitGlobal: "cover",
  transitionEffect: "fade", // "fade" | "slide" | "zoom" | "flip"
  banners: [
    {
      id: "banner_promo_mbs",
      type: "image",
      title: "KHUYẾN MÃI TRI ÂN ĐẶC BIỆT",
      subtitle: "Marina Bay Sands MBS - Thưởng nạp tích lũy lên tới 588.888$",
      url: promoBannerImg,
      poster: "",
      autoPlay: true,
      loop: true,
      muted: true,
      controls: false,
      active: true,
      linkUrl: "",
      badge: "HOT 🎁",
      objectFit: "cover"
    },
    {
      id: "banner_1",
      type: "video", // "video" | "image"
      title: "Sands Club Live Casino",
      subtitle: "Sòng bài trực tuyến uy tín hàng đầu",
      url: "https://media.base44.com/videos/public/6a729d033f9d0f63f381a6c6/ac9c0fbcd_6faa31b965e5d1deaeb62d0f29225b5b1.mp4",
      poster: "https://media.base44.com/images/public/6a729d033f9d0f63f381a6c6/e57f331cd_708f7e507_e87283081c2ffaf4802a737a4f6e0a1d686d3b3c.png",
      autoPlay: true,
      loop: true,
      muted: true,
      controls: false,
      active: true,
      linkUrl: "",
      badge: "LIVE CASINO 🎰",
      objectFit: "cover"
    },
    {
      id: "banner_2",
      type: "image",
      title: "Khuyến Mãi Siêu Thưởng",
      subtitle: "Nạp tiền tức thì - Tỷ lệ 1:1 bảo mật tuyệt đối",
      url: "https://media.base44.com/images/public/6a729d033f9d0f63f381a6c6/51180f3b5_b60421ada_4b68ef08ef88c5e8b3877cb04357aa802c84a60d.png",
      poster: "",
      autoPlay: true,
      loop: true,
      muted: true,
      controls: false,
      active: true,
      linkUrl: "",
      badge: "SỰ KIỆN 🎁",
      objectFit: "cover"
    }
  ]
};

const listeners = new Set();

let channel = null;
if (typeof window !== "undefined" && typeof BroadcastChannel !== "undefined") {
  try {
    channel = new BroadcastChannel("sands_banner_realtime_channel");
    channel.onmessage = (e) => {
      if (e.data?.type === "BANNER_CONFIG_UPDATED" && e.data?.config) {
        listeners.forEach((cb) => cb(e.data.config));
      }
    };
  } catch {
    /* ignore */
  }
}

if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === STORAGE_KEY) {
      const current = getBannerConfig();
      listeners.forEach((cb) => cb(current));
    }
  });
}

export const getBannerConfig = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_BANNER_CONFIG;
    const parsed = JSON.parse(raw);
    const banners = Array.isArray(parsed.banners) && parsed.banners.length > 0 ? parsed.banners : DEFAULT_BANNER_CONFIG.banners;
    
    // Đảm bảo banner Khuyến Mãi Tri Ân Đặc Biệt luôn có mặt trong danh sách nếu chưa được thêm
    const hasPromo = banners.some((b) => b.id === "banner_promo_mbs" || b.url === promoBannerImg);
    const finalBanners = hasPromo ? banners : [DEFAULT_BANNER_CONFIG.banners[0], ...banners];

    return {
      ...DEFAULT_BANNER_CONFIG,
      ...parsed,
      banners: finalBanners
    };
  } catch {
    return DEFAULT_BANNER_CONFIG;
  }
};

export const saveBannerConfig = (config) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch {
    /* ignore */
  }

  listeners.forEach((cb) => cb(config));

  try {
    window.dispatchEvent(new CustomEvent("sands-banner-updated", { detail: config }));
  } catch {
    /* ignore */
  }

  if (channel) {
    try {
      channel.postMessage({ type: "BANNER_CONFIG_UPDATED", config });
    } catch {
      /* ignore */
    }
  }
  return config;
};

export const subscribeBannerConfig = (cb) => {
  listeners.add(cb);
  return () => listeners.delete(cb);
};

// Helper: Convert File to DataURL or Web URL
export const readFileAsDataUrl = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(file);
  });
};

// Helper: Extract Images / Videos from ZIP Archive
export const extractZipArchive = async (zipFile) => {
  const zip = new JSZip();
  const contents = await zip.loadAsync(zipFile);
  const extractedFiles = [];

  const validExts = [".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg", ".mp4", ".webm", ".mov"];

  for (const filename of Object.keys(contents.files)) {
    const fileEntry = contents.files[filename];
    if (fileEntry.dir) continue;

    const lowerName = filename.toLowerCase();
    const isValid = validExts.some((ext) => lowerName.endsWith(ext));
    if (!isValid) continue;

    const isVideo = lowerName.endsWith(".mp4") || lowerName.endsWith(".webm") || lowerName.endsWith(".mov");
    const mimeType = isVideo
      ? (lowerName.endsWith(".webm") ? "video/webm" : "video/mp4")
      : "image/" + (lowerName.endsWith(".png") ? "png" : lowerName.endsWith(".webp") ? "webp" : "jpeg");

    const base64Data = await fileEntry.async("base64");
    const dataUrl = `data:${mimeType};base64,${base64Data}`;

    // Clean title from file name
    const cleanName = filename.split("/").pop().replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");

    extractedFiles.push({
      id: "banner_" + Date.now().toString(36) + "_" + Math.random().toString(36).substring(2, 6),
      type: isVideo ? "video" : "image",
      title: cleanName.toUpperCase() || "Sands Banner",
      subtitle: isVideo ? "Video Banner Sands Club" : "Ảnh Banner Sands Club",
      badge: "NEW ✨",
      url: dataUrl,
      poster: "",
      autoPlay: true,
      loop: true,
      muted: true,
      controls: false,
      active: true,
      linkUrl: "",
      objectFit: "cover"
    });
  }

  return extractedFiles;
};
