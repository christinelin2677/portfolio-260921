export interface GalleryProject {
  id: string;
  title: string;
  description: string;
  image: string;
  url: string;
  tags: string[];
}

// Add real AI experiments here when their covers and destination links are ready.
export const GALLERY_PROJECTS: GalleryProject[] = [];
