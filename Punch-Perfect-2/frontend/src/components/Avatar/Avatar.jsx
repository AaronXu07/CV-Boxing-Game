import { useState, useEffect } from 'react';
import './Avatar.css';

const DEFAULT_AVATAR = '/images/default-avatar.svg';

const Avatar = ({ src, alt = 'User Avatar', size = 40, className = '' }) => {
  const [imgSrc, setImgSrc] = useState(src || DEFAULT_AVATAR);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setImgSrc(src || DEFAULT_AVATAR);
    setHasError(false);
  }, [src]);

  const handleError = () => {
    if (!hasError) {
      setImgSrc(DEFAULT_AVATAR);
      setHasError(true);
    }
  };

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={`user-avatar ${className}`}
      width={size}
      height={size}
      onError={handleError}
      loading="lazy"
      style={{ width: size, height: size, minWidth: size, minHeight: size }} 
    />
  );
};

export default Avatar;
