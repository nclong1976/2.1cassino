import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  Upload,
  Plus,
  Trash2,
  Edit,
  Save,
  Video,
  Image as ImageIcon,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Eye,
  Copy,
  RefreshCw,
  FolderArchive,
  FileCheck,
  Maximize2,
  Minimize2
} from "lucide-react";
import { Panel, inputCls, Badge } from "../ui";
import {
  getBannerConfig,
  saveBannerConfig,
  PRESET_BANNERS,
  DEFAULT_BANNER_CONFIG,
  readFileAsDataUrl,
  extractZipArchive
} from "@/lib/bannerStore";

export default function Banners() {
  const { toast } = useToast();
  const [config, setConfig] = useState(getBannerConfig());
  const [openModal, setOpenModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // Form State for modal
  const [form, setForm] = useState({
    id: "",
    type: "video", // "video" | "image"
    title: "",
    subtitle: "",
    badge: "",
    url: "",
    poster: "",
    autoPlay: true,
    loop: true,
    muted: true,
    controls: false,
    active: true,
    linkUrl: "",
    objectFit: "cover" // "cover" | "contain"
  });

  const handleSaveConfig = (newConfig = config) => {
    saveBannerConfig(newConfig);
    setConfig(newConfig);
    toast({
      title: "Đã lưu cài đặt Banner",
      description: "Thay đổi video/ảnh banner đã được áp dụng ngay lập tức cho trang chủ.",
      variant: "success",
    });
  };

  const handleToggleCarousel = (enabled) => {
    const updated = { ...config, enableCarousel: enabled };
    handleSaveConfig(updated);
  };

  const handleChangeInterval = (seconds) => {
    const updated = { ...config, autoplayInterval: Number(seconds) * 1000 };
    handleSaveConfig(updated);
  };

  const handleChangeHeight = (height) => {
    const updated = { ...config, bannerHeight: height };
    handleSaveConfig(updated);
  };

  const handleChangeGlobalFit = (fitMode) => {
    const updated = { ...config, objectFitGlobal: fitMode };
    handleSaveConfig(updated);
  };

  const handleChangeTransitionEffect = (effect) => {
    const updated = { ...config, transitionEffect: effect };
    handleSaveConfig(updated);
  };

  const handleOpenAdd = () => {
    setEditingBanner(null);
    setForm({
      id: "banner_" + Date.now().toString(36),
      type: "video",
      title: "Sands Club Live",
      subtitle: "Sòng bài giải trí trực tuyến",
      badge: "HOT 💥",
      url: "https://media.base44.com/videos/public/6a729d033f9d0f63f381a6c6/ac9c0fbcd_6faa31b965e5d1deaeb62d0f29225b5b1.mp4",
      poster: "https://media.base44.com/images/public/6a729d033f9d0f63f381a6c6/e57f331cd_708f7e507_e87283081c2ffaf4802a737a4f6e0a1d686d3b3c.png",
      autoPlay: true,
      loop: true,
      muted: true,
      controls: false,
      active: true,
      linkUrl: "",
      objectFit: "cover"
    });
    setOpenModal(true);
  };

  const handleOpenEdit = (banner) => {
    setEditingBanner(banner);
    setForm({
      objectFit: "cover",
      ...banner
    });
    setOpenModal(true);
  };

  const handleAddPreset = (preset) => {
    const newBanner = {
      id: "banner_" + Date.now().toString(36),
      type: preset.type,
      title: preset.title,
      subtitle: preset.subtitle,
      badge: preset.badge,
      url: preset.url,
      poster: preset.poster || "",
      autoPlay: true,
      loop: true,
      muted: true,
      controls: false,
      active: true,
      linkUrl: "",
      objectFit: preset.objectFit || "cover"
    };
    const updated = { ...config, banners: [newBanner, ...config.banners] };
    handleSaveConfig(updated);
  };

  // Helper to process multiple files or ZIP archives uploaded
  const processBatchFiles = async (files) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setUploadProgress(10);

    try {
      const newBanners = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploadProgress(Math.round(((i + 1) / files.length) * 80));

        // Case 1: ZIP Archive File -> Unzip and extract all images/videos
        if (file.name.toLowerCase().endsWith(".zip")) {
          toast({
            title: "Đang giải nén file ZIP...",
            description: `Tệp: ${file.name}`,
          });
          const extracted = await extractZipArchive(file);
          if (extracted.length > 0) {
            newBanners.push(...extracted);
            toast({
              title: "Đã giải nén ZIP thành công!",
              description: `Đã tìm thấy và trích xuất ${extracted.length} ảnh/video banner.`,
              variant: "success",
            });
          } else {
            toast({
              title: "File ZIP không chứa ảnh/video hỗ trợ",
              variant: "destructive",
            });
          }
        }
        // Case 2: Individual Image or Video File
        else {
          let fileUrl = "";
          try {
            // Try server integration first
            const res = await base44.integrations.Core.UploadFile({ file });
            if (res?.file_url) fileUrl = res.file_url;
          } catch {
            /* ignore server error, fallback to Data URL */
          }

          if (!fileUrl) {
            // Convert to Base64 Data URL so it never breaks
            fileUrl = await readFileAsDataUrl(file);
          }

          const isVideo = file.type.startsWith("video") || file.name.match(/\.(mp4|webm|mov)$/i);
          const cleanTitle = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ").toUpperCase();

          newBanners.push({
            id: "banner_" + Date.now().toString(36) + "_" + Math.random().toString(36).substring(2, 6),
            type: isVideo ? "video" : "image",
            title: cleanTitle || "Sands Banner",
            subtitle: isVideo ? "Video Banner Sands Club" : "Ảnh Banner Sands Club",
            badge: "NEW ✨",
            url: fileUrl,
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
      }

      setUploadProgress(100);

      if (newBanners.length > 0) {
        const updated = { ...config, banners: [...newBanners, ...config.banners] };
        handleSaveConfig(updated);
        toast({
          title: "Đã cập nhật danh sách Banner!",
          description: `Đã thêm ${newBanners.length} banner mới vào trang chủ.`,
          variant: "success",
        });
      }
    } catch (err) {
      toast({
        title: "Lỗi xử lý file upload",
        description: err.message || "Không thể tải file",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleUploadFile = async (e, fieldTarget = "url") => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (files.length > 1 || files[0].name.toLowerCase().endsWith(".zip")) {
      await processBatchFiles(files);
      return;
    }

    const file = files[0];
    setUploading(true);
    setUploadProgress(20);

    try {
      let finalUrl = "";
      try {
        const res = await base44.integrations.Core.UploadFile({ file });
        if (res?.file_url) finalUrl = res.file_url;
      } catch {
        /* fallback */
      }

      if (!finalUrl) {
        finalUrl = await readFileAsDataUrl(file);
      }

      setUploadProgress(100);
      const isVideo = file.type.startsWith("video") || file.name.match(/\.(mp4|webm|mov)$/i);

      setForm((prev) => ({
        ...prev,
        [fieldTarget]: finalUrl,
        type: fieldTarget === "url" ? (isVideo ? "video" : "image") : prev.type,
      }));

      toast({
        title: "Tải file thành công",
        description: `Đã chọn: ${file.name}`,
        variant: "success",
      });
    } catch {
      toast({
        title: "Lỗi đọc file",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      await processBatchFiles(files);
    }
  };

  const handleSubmitBanner = () => {
    if (!form.url) {
      toast({ title: "Vui lòng nhập hoặc tải file URL media", variant: "destructive" });
      return;
    }

    let nextBanners = [];
    if (editingBanner) {
      nextBanners = config.banners.map((b) => (b.id === editingBanner.id ? { ...form } : b));
    } else {
      nextBanners = [...config.banners, { ...form }];
    }

    const updated = { ...config, banners: nextBanners };
    handleSaveConfig(updated);
    setOpenModal(false);
  };

  const handleDeleteBanner = (id) => {
    if (config.banners.length <= 1) {
      toast({ title: "Cần giữ lại ít nhất 1 banner trong hệ thống", variant: "destructive" });
      return;
    }
    const nextBanners = config.banners.filter((b) => b.id !== id);
    const updated = { ...config, banners: nextBanners };
    handleSaveConfig(updated);
  };

  const handleToggleActive = (id) => {
    const nextBanners = config.banners.map((b) => (b.id === id ? { ...b, active: !b.active } : b));
    const updated = { ...config, banners: nextBanners };
    handleSaveConfig(updated);
  };

  const handleMove = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= config.banners.length) return;

    const nextBanners = [...config.banners];
    const temp = nextBanners[index];
    nextBanners[index] = nextBanners[targetIndex];
    nextBanners[targetIndex] = temp;

    const updated = { ...config, banners: nextBanners };
    handleSaveConfig(updated);
  };

  const handleResetDefault = () => {
    saveBannerConfig(DEFAULT_BANNER_CONFIG);
    setConfig(DEFAULT_BANNER_CONFIG);
    toast({ title: "Đã khôi phục cài đặt banner mặc định ban đầu" });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <Video className="w-6 h-6 text-[#7033ff]" />
            Quản Lý Banner Video & Ảnh
          </h1>
          <p className="text-xs sm:text-sm text-white/60 mt-1">
            Tải lên ảnh từ máy, file ZIP chứa nhiều ảnh/video, hoặc link Video MP4. Hệ thống tự động giải nén và đồng bộ thời gian thực cho trang chủ.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleResetDefault}
            className="border-white/10 hover:bg-white/5 text-white/80 text-xs"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Khôi phục mặc định
          </Button>
          <Button
            onClick={handleOpenAdd}
            className="bg-gradient-to-r from-[#7033ff] to-[#4b00ff] hover:opacity-90 text-white font-semibold text-xs sm:text-sm shadow-lg"
          >
            <Plus className="w-4 h-4 mr-1.5" /> Thêm Banner Mới
          </Button>
        </div>
      </div>

      {/* Batch Upload & Drag-and-Drop Zone */}
      <Panel
        className={`p-6 border-2 border-dashed transition-all cursor-pointer relative overflow-hidden ${
          isDragging
            ? "border-[#7033ff] bg-[#7033ff]/10 scale-[1.01]"
            : "border-white/20 hover:border-[#7033ff]/60 bg-white/[0.02]"
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center text-center space-y-3">
          <div className="p-3.5 rounded-2xl bg-gradient-to-tr from-[#7033ff]/30 to-[#ffab40]/30 border border-white/20 text-white shadow-xl">
            <FolderArchive className="w-8 h-8 text-[#ffab40]" />
          </div>

          <div>
            <h3 className="text-sm sm:text-base font-bold text-white">
              Kéo thả file Ảnh, Video hoặc file ZIP vào đây để tự động tải lên
            </h3>
            <p className="text-xs text-white/60 mt-1 max-w-lg">
              Hỗ trợ file đơn lẻ (.png, .jpg, .webp, .mp4) hoặc file nén .ZIP chứa bộ ảnh/video banner. Hệ thống sẽ tự động giải nén và hiển thị ngay lập tức!
            </p>
          </div>

          <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#7033ff] hover:bg-[#5f23ee] text-white text-xs font-bold transition-all shadow-md">
            <Upload className="w-4 h-4" /> Chọn File / File ZIP từ Máy
            <input
              type="file"
              multiple
              className="hidden"
              accept="image/*,video/*,.zip"
              onChange={(e) => processBatchFiles(e.target.files)}
            />
          </label>
        </div>

        {uploading && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-4 z-30">
            <FileCheck className="w-8 h-8 text-[#ffab40] animate-bounce mb-2" />
            <p className="text-sm font-bold text-white">Đang tải & xử lý file ({uploadProgress}%)...</p>
            <div className="w-64 bg-white/20 h-2 rounded-full overflow-hidden mt-2">
              <div
                className="bg-gradient-to-r from-[#7033ff] to-[#ffab40] h-full transition-all duration-200"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}
      </Panel>

      {/* Display Controls */}
      <Panel className="p-4 sm:p-5 space-y-4">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#ffab40]" /> Cấu hình hiển thị Slider & Banner
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 pt-1 border-t border-white/10">
          <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
            <div>
              <p className="text-xs font-semibold text-white">Trình chiếu Carousel</p>
              <p className="text-[11px] text-white/50">Tự động chuyển slide khi có nhiều banner</p>
            </div>
            <Switch
              checked={!!config.enableCarousel}
              onCheckedChange={handleToggleCarousel}
            />
          </div>

          <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
            <label className="text-xs font-semibold text-white block">Thời gian chuyển slide</label>
            <select
              className={inputCls}
              value={(config.autoplayInterval || 6000) / 1000}
              onChange={(e) => handleChangeInterval(e.target.value)}
            >
              <option value="3" className="bg-[#0f1225]">3 giây (Nhanh)</option>
              <option value="5" className="bg-[#0f1225]">5 giây (Tiêu chuẩn)</option>
              <option value="6" className="bg-[#0f1225]">6 giây (Khuyên dùng)</option>
              <option value="8" className="bg-[#0f1225]">8 giây</option>
              <option value="10" className="bg-[#0f1225]">10 giây</option>
            </select>
          </div>

          <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
            <label className="text-xs font-semibold text-white block">Chiều cao Banner trên Mobile</label>
            <select
              className={inputCls}
              value={config.bannerHeight || "180px"}
              onChange={(e) => handleChangeHeight(e.target.value)}
            >
              <option value="140px" className="bg-[#0f1225]">Nhỏ (140px)</option>
              <option value="180px" className="bg-[#0f1225]">Vừa (180px - Khuyên dùng)</option>
              <option value="220px" className="bg-[#0f1225]">Lớn (220px)</option>
              <option value="260px" className="bg-[#0f1225]">Siêu Lớn (260px)</option>
            </select>
          </div>

          <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
            <label className="text-xs font-semibold text-white block">Chế độ khớp khung hình (Fit)</label>
            <select
              className={inputCls}
              value={config.objectFitGlobal || "cover"}
              onChange={(e) => handleChangeGlobalFit(e.target.value)}
            >
              <option value="cover" className="bg-[#0f1225]">Cắt đẹp phủ kín (Cover)</option>
              <option value="contain" className="bg-[#0f1225]">Hiển thị toàn bộ không cắt (Contain)</option>
            </select>
          </div>

          <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
            <label className="text-xs font-semibold text-white block">Hiệu ứng chuyển slide</label>
            <select
              className={inputCls}
              value={config.transitionEffect || "fade"}
              onChange={(e) => handleChangeTransitionEffect(e.target.value)}
            >
              <option value="fade" className="bg-[#0f1225]">Mờ dần (Fade)</option>
              <option value="slide" className="bg-[#0f1225]">Trượt ngang (Slide)</option>
              <option value="zoom" className="bg-[#0f1225]">Phóng to (Zoom)</option>
              <option value="flip" className="bg-[#0f1225]">Xoay 3D (Flip)</option>
            </select>
          </div>
        </div>
      </Panel>

      {/* Preset Banner Quick Selection */}
      <Panel className="p-4 sm:p-5 space-y-3">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Copy className="w-4 h-4 text-[#ffab40]" /> Mẫu Banner Có Sẵn (Presets 1-Click)
        </h2>
        <p className="text-xs text-white/60">Thêm nhanh các mẫu banner cao cấp chuẩn HD vào danh sách:</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {PRESET_BANNERS.map((preset, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-white/5 border border-white/10 hover:border-[#7033ff]/50 transition-all flex flex-col justify-between space-y-2 group"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/10 text-white/90 flex items-center gap-1">
                    {preset.type === "video" ? <Video className="w-3 h-3 text-[#ffab40]" /> : <ImageIcon className="w-3 h-3 text-emerald-400" />}
                    {preset.type === "video" ? "Video MP4" : "Hình ảnh"}
                  </span>
                  <Badge tone={preset.type === "video" ? "amber" : "purple"}>{preset.badge}</Badge>
                </div>
                <p className="text-xs font-bold text-white group-hover:text-[#ffab40] transition-colors">{preset.title}</p>
                <p className="text-[11px] text-white/50 line-clamp-1">{preset.subtitle}</p>
              </div>

              <Button
                size="sm"
                variant="secondary"
                onClick={() => handleAddPreset(preset)}
                className="w-full h-8 text-xs bg-white/10 hover:bg-[#7033ff] hover:text-white transition-colors mt-2"
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Thêm Mẫu Này
              </Button>
            </div>
          ))}
        </div>
      </Panel>

      {/* Banner List Table */}
      <Panel className="p-4 sm:p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Eye className="w-4 h-4 text-[#7033ff]" /> Danh sách Banner Đang Hoạt Động ({config.banners.length})
          </h2>
          <Button
            size="sm"
            onClick={handleOpenAdd}
            className="bg-[#7033ff] hover:bg-[#5b22e0] text-white text-xs h-8"
          >
            <Plus className="w-3.5 h-3.5 mr-1" /> Thêm Banner
          </Button>
        </div>

        <div className="space-y-3">
          {config.banners.map((item, index) => (
            <div
              key={item.id}
              className={`p-3 sm:p-4 rounded-2xl border transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                item.active
                  ? "bg-white/[0.03] border-white/10 hover:border-white/20"
                  : "bg-black/20 border-white/5 opacity-60"
              }`}
            >
              {/* Left: Thumbnail & Info */}
              <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
                {/* Media Preview Box */}
                <div className="w-28 h-18 rounded-xl overflow-hidden bg-black/80 border border-white/10 shrink-0 relative flex items-center justify-center">
                  {item.type === "video" ? (
                    <video
                      src={item.url}
                      poster={item.poster || undefined}
                      muted
                      className={`w-full h-full ${item.objectFit === "contain" ? "object-contain" : "object-cover"}`}
                    />
                  ) : (
                    <img
                      src={item.url}
                      alt=""
                      className={`w-full h-full ${item.objectFit === "contain" ? "object-contain" : "object-cover"}`}
                    />
                  )}
                  <span className="absolute top-1 left-1 bg-black/80 text-[9px] font-bold px-1.5 py-0.5 rounded text-white border border-white/20 flex items-center gap-0.5">
                    {item.type === "video" ? <Video className="w-2.5 h-2.5 text-[#ffab40]" /> : <ImageIcon className="w-2.5 h-2.5 text-emerald-400" />}
                    {item.type === "video" ? "Video" : "Ảnh"}
                  </span>
                </div>

                {/* Text details */}
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-white truncate">{item.title || "Chưa đặt tiêu đề"}</span>
                    {item.badge && <Badge tone="purple">{item.badge}</Badge>}
                    <Badge tone={item.active ? "green" : "neutral"}>
                      {item.active ? "Đang bật" : "Đã ẩn"}
                    </Badge>
                  </div>
                  <p className="text-xs text-white/60 truncate">{item.subtitle || "Không có phụ đề"}</p>
                  <p className="text-[11px] text-white/40 truncate font-mono">
                    {item.url.startsWith("data:") ? "[File Ảnh/Video tải từ máy cục bộ]" : item.url}
                  </p>
                </div>
              </div>

              {/* Right: Controls & Actions */}
              <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                {/* Move order */}
                <div className="flex items-center bg-white/5 rounded-lg border border-white/10 p-0.5">
                  <button
                    onClick={() => handleMove(index, -1)}
                    disabled={index === 0}
                    className="p-1.5 hover:bg-white/10 disabled:opacity-20 text-white rounded transition-colors"
                    title="Chuyển lên"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleMove(index, 1)}
                    disabled={index === config.banners.length - 1}
                    className="p-1.5 hover:bg-white/10 disabled:opacity-20 text-white rounded transition-colors"
                    title="Chuyển xuống"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Toggle Active */}
                <div className="flex items-center gap-1.5 px-2 py-1 bg-white/5 rounded-lg border border-white/10">
                  <span className="text-[11px] text-white/60">{item.active ? "Hiện" : "Ẩn"}</span>
                  <Switch
                    checked={!!item.active}
                    onCheckedChange={() => handleToggleActive(item.id)}
                  />
                </div>

                {/* Edit */}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleOpenEdit(item)}
                  className="border-white/10 hover:bg-white/10 text-white text-xs h-8"
                >
                  <Edit className="w-3.5 h-3.5 mr-1" /> Sửa
                </Button>

                {/* Delete */}
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDeleteBanner(item.id)}
                  className="bg-red-500/20 hover:bg-red-500/30 text-red-300 text-xs h-8 border border-red-500/30"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Panel>

      {/* Edit / Add Modal */}
      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogContent className="max-w-xl bg-[#0f1225] border-white/10 text-white rounded-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-white flex items-center gap-2">
              {editingBanner ? <Edit className="w-5 h-5 text-[#7033ff]" /> : <Plus className="w-5 h-5 text-[#7033ff]" />}
              {editingBanner ? "Chỉnh Sửa Banner" : "Thêm Banner Mới"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Type Selector Tabs */}
            <div>
              <label className="text-xs font-semibold text-white/80 mb-1.5 block">Loại Media Banner</label>
              <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-white/5 border border-white/10">
                <button
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, type: "video" }))}
                  className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                    form.type === "video"
                      ? "bg-gradient-to-r from-[#7033ff] to-[#4b00ff] text-white shadow-md"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Video className="w-4 h-4" /> Video (MP4 / WebM)
                </button>
                <button
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, type: "image" }))}
                  className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                    form.type === "image"
                      ? "bg-gradient-to-r from-[#7033ff] to-[#4b00ff] text-white shadow-md"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <ImageIcon className="w-4 h-4" /> Hình Ảnh (PNG, JPG, WEBP)
                </button>
              </div>
            </div>

            {/* Media Upload & URL Input */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-white/80">
                  {form.type === "video" ? "URL hoặc File Video từ Máy" : "URL hoặc File Ảnh từ Máy"}
                </label>
                <span className="text-[11px] text-[#ffab40]">
                  {form.type === "video" ? "MP4 / WebM" : "Hỗ trợ upload file đơn hoặc ZIP"}
                </span>
              </div>

              <div className="flex gap-2">
                <input
                  className={inputCls}
                  value={form.url || ""}
                  onChange={(e) => setForm((p) => ({ ...p, url: e.target.value }))}
                  placeholder={form.type === "video" ? "https://domain.com/banner.mp4" : "https://domain.com/banner.png"}
                />

                <label className="h-9 px-3.5 rounded-lg bg-[#7033ff]/30 hover:bg-[#7033ff]/50 border border-[#7033ff]/50 text-xs font-semibold flex items-center gap-1.5 cursor-pointer whitespace-nowrap text-white transition-colors shrink-0">
                  <Upload size={14} /> Tải từ máy
                  <input
                    type="file"
                    className="hidden"
                    accept={form.type === "video" ? "video/*,.zip" : "image/*,.zip"}
                    onChange={(e) => handleUploadFile(e, "url")}
                  />
                </label>
              </div>
            </div>

            {/* Fit mode option */}
            <div>
              <label className="text-xs font-semibold text-white/80 mb-1 block">Chế độ hiển thị chữ & hình ảnh (Fit Mode)</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, objectFit: "cover" }))}
                  className={`p-2 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    form.objectFit === "cover" ? "bg-[#7033ff]/30 border-[#7033ff] text-white" : "bg-white/5 border-white/10 text-white/60"
                  }`}
                >
                  <Maximize2 className="w-3.5 h-3.5" /> Cover (Phủ kín)
                </button>
                <button
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, objectFit: "contain" }))}
                  className={`p-2 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    form.objectFit === "contain" ? "bg-[#7033ff]/30 border-[#7033ff] text-white" : "bg-white/5 border-white/10 text-white/60"
                  }`}
                >
                  <Minimize2 className="w-3.5 h-3.5" /> Contain (Toàn bộ chữ/ảnh)
                </button>
              </div>
            </div>

            {/* Live Admin Preview */}
            {form.url && (
              <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-1.5">
                <p className="text-[11px] font-bold text-white/70 uppercase tracking-wider flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5 text-[#ffab40]" /> Xem trước Banner Live:
                </p>
                <div className="relative w-full h-40 rounded-lg overflow-hidden bg-black flex items-center justify-center border border-white/10">
                  {form.type === "video" ? (
                    <video
                      src={form.url}
                      poster={form.poster || undefined}
                      autoPlay={form.autoPlay}
                      loop={form.loop}
                      muted={form.muted}
                      controls={form.controls}
                      className={`w-full h-full ${form.objectFit === "contain" ? "object-contain" : "object-cover"}`}
                    />
                  ) : (
                    <img
                      src={form.url}
                      alt=""
                      className={`w-full h-full ${form.objectFit === "contain" ? "object-contain" : "object-cover"}`}
                    />
                  )}

                  {(form.title || form.badge) && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-3 pointer-events-none">
                      {form.badge && (
                        <span className="self-start text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#7033ff] text-white mb-1">
                          {form.badge}
                        </span>
                      )}
                      <p className="text-xs font-bold text-white">{form.title}</p>
                      <p className="text-[10px] text-white/70">{form.subtitle}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Video Options */}
            {form.type === "video" && (
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-2">
                <p className="text-xs font-bold text-white">Cấu hình video</p>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer text-white/80">
                    <input
                      type="checkbox"
                      checked={!!form.autoPlay}
                      onChange={(e) => setForm((p) => ({ ...p, autoPlay: e.target.checked }))}
                      className="rounded accent-[#7033ff]"
                    />
                    Tự động phát (Autoplay)
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-white/80">
                    <input
                      type="checkbox"
                      checked={!!form.loop}
                      onChange={(e) => setForm((p) => ({ ...p, loop: e.target.checked }))}
                      className="rounded accent-[#7033ff]"
                    />
                    Lặp lại liên tục (Loop)
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-white/80">
                    <input
                      type="checkbox"
                      checked={!!form.muted}
                      onChange={(e) => setForm((p) => ({ ...p, muted: e.target.checked }))}
                      className="rounded accent-[#7033ff]"
                    />
                    Tắt tiếng (Muted)
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-white/80">
                    <input
                      type="checkbox"
                      checked={!!form.controls}
                      onChange={(e) => setForm((p) => ({ ...p, controls: e.target.checked }))}
                      className="rounded accent-[#7033ff]"
                    />
                    Hiện thanh điều khiển
                  </label>
                </div>
              </div>
            )}

            {/* Title & Subtitle */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-white/80 mb-1 block">Tiêu đề Banner</label>
                <input
                  className={inputCls}
                  value={form.title || ""}
                  onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                  placeholder="Ví dụ: Sands Club Live Casino"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-white/80 mb-1 block">Nhãn Badge (Góc banner)</label>
                <input
                  className={inputCls}
                  value={form.badge || ""}
                  onChange={(e) => setForm((p) => ({ ...p, badge: e.target.value }))}
                  placeholder="Ví dụ: HOT 💥 hoặc VIP 💎"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-white/80 mb-1 block">Mô tả / Phụ đề banner</label>
              <input
                className={inputCls}
                value={form.subtitle || ""}
                onChange={(e) => setForm((p) => ({ ...p, subtitle: e.target.value }))}
                placeholder="Mô tả ngắn gọn hiển thị trên banner..."
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-white/80 mb-1 block">Đường dẫn liên kết khi bấm vào (Link Target)</label>
              <input
                className={inputCls}
                value={form.linkUrl || ""}
                onChange={(e) => setForm((p) => ({ ...p, linkUrl: e.target.value }))}
                placeholder="https://... (Để trống nếu không muốn chuyển trang)"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/10">
              <span className="text-xs font-semibold text-white">Bật trạng thái hoạt động</span>
              <Switch
                checked={!!form.active}
                onCheckedChange={(v) => setForm((p) => ({ ...p, active: v }))}
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-white/10">
            <Button
              variant="outline"
              onClick={() => setOpenModal(false)}
              className="border-white/10 hover:bg-white/5 text-white text-xs"
            >
              Hủy
            </Button>
            <Button
              onClick={handleSubmitBanner}
              className="bg-gradient-to-r from-[#7033ff] to-[#4b00ff] text-white font-bold text-xs"
            >
              <Save className="w-4 h-4 mr-1.5" /> Lưu Banner
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
