function getImageUrlWithSize(result, wantedSize) {
  const defaultUrl = "https://res.cloudinary.com/albin-groen/image/upload";

  const urlWithCustomWidth = width =>
    `${defaultUrl}/w_${width}/v${result.version}/${result.public_id}.jpg`;

  const sizes = {
    sm: urlWithCustomWidth(0.5),
    lg: urlWithCustomWidth(1.5)
  };

  return sizes[wantedSize] || "";
}

module.exports = {
  getImageUrlWithSize
}