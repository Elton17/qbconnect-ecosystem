
ALTER TABLE public.products ADD COLUMN images text[] DEFAULT '{}';
UPDATE public.products SET images = CASE WHEN image_url != '' AND image_url IS NOT NULL THEN ARRAY[image_url] ELSE '{}' END;
