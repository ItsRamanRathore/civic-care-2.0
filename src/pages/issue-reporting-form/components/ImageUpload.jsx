import React, { useState, useRef } from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const ImageUpload = ({ images = [], onImagesChange, maxImages = 5, className = "" }) => {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (e?.type === "dragenter" || e?.type === "dragover") {
      setDragActive(true);
    } else if (e?.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e?.dataTransfer?.files);
    handleFiles(files);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e?.target?.files);
    handleFiles(files);
  };

  const handleFiles = (files) => {
    const imageFiles = files?.filter(file => file?.type?.startsWith('image/'));
    const remainingSlots = maxImages - images?.length;
    const filesToAdd = imageFiles?.slice(0, remainingSlots);

    const newImages = filesToAdd?.map(file => ({
      id: Date.now() + Math.random(),
      file,
      url: URL.createObjectURL(file),
      name: file?.name,
      size: file?.size
    }));

    onImagesChange([...images, ...newImages]);
  };

  const removeImage = (imageId) => {
    const updatedImages = images?.filter(img => img?.id !== imageId);
    onImagesChange(updatedImages);
  };

  const openFileDialog = () => {
    fileInputRef?.current?.click();
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i))?.toFixed(2)) + ' ' + sizes?.[i];
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center space-x-2">
        <Icon name="Camera" size={18} className="text-primary" />
        <h3 className="text-sm font-medium text-text-primary">Upload Photos</h3>
        <span className="text-xs text-muted-foreground">({images?.length}/{maxImages})</span>
      </div>
      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
          dragActive 
            ? 'border-primary bg-primary/5' :'border-border hover:border-primary/50 hover:bg-muted/50'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        <div className="text-center">
          <Icon name="Upload" size={32} className="mx-auto text-muted-foreground mb-3" />
          <p className="text-sm font-medium text-text-primary mb-1">
            Drop images here or click to upload
          </p>
          <p className="text-xs text-muted-foreground mb-4">
            PNG, JPG, JPEG up to 10MB each. Maximum {maxImages} images.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={openFileDialog}
            disabled={images?.length >= maxImages}
            iconName="Plus"
            iconPosition="left"
            iconSize={16}
          >
            Choose Files
          </Button>
        </div>
      </div>
      {/* Image Previews */}
      {images?.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-text-primary">Uploaded Images</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {images?.map((image) => (
              <div key={image?.id} className="relative group">
                <div className="aspect-square bg-muted rounded-lg overflow-hidden border border-border">
                  <Image
                    src={image?.url}
                    alt={image?.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => removeImage(image?.id)}
                  className="absolute -top-2 -right-2 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Icon name="X" size={12} />
                </Button>
                <div className="mt-1">
                  <p className="text-xs text-text-primary truncate">{image?.name}</p>
                  <p className="text-xs text-muted-foreground">{formatFileSize(image?.size)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Upload Guidelines */}
      <div className="bg-muted/50 rounded-md p-3">
        <h5 className="text-xs font-medium text-text-primary mb-2">Photo Guidelines:</h5>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• Take clear, well-lit photos showing the issue</li>
          <li>• Include multiple angles if possible</li>
          <li>• Avoid blurry or dark images</li>
          <li>• Photos help authorities understand and resolve issues faster</li>
        </ul>
      </div>
    </div>
  );
};

export default ImageUpload;