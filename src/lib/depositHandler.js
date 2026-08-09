/**
 * Handles deposit request by checking authentication, showing feedback toast,
 * and opening support chat.
 */
export function handleDepositRequest({ user, navigate, toast, openChat }) {
  if (!user) {
    if (toast) {
      toast({
        title: "Yêu cầu đăng nhập",
        description: "Vui lòng đăng nhập để thực hiện nạp tiền.",
        variant: "destructive",
      });
    }
    if (navigate) {
      navigate("/login");
    } else {
      window.location.href = "/login";
    }
    return;
  }

  // Toast feedback
  if (toast) {
    toast({
      title: "Kết nối CSKH",
      description: "Đang kết nối tới bộ phận CSKH để hỗ trợ nạp tiền...",
    });
  }

  // Open support chat sheet
  if (openChat) {
    openChat();
  }
}

