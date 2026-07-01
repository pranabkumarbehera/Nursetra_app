import struct
import sys

def find_bbox(bmp_path):
    with open(bmp_path, 'rb') as f:
        header = f.read(54)
        if header[:2] != b'BM':
            print("Not a valid BMP")
            return
        
        data_offset = struct.unpack('<I', header[10:14])[0]
        width = struct.unpack('<i', header[18:22])[0]
        height_raw = struct.unpack('<i', header[22:26])[0]
        bpp = struct.unpack('<H', header[28:30])[0]
        
        height = abs(height_raw)
        f.seek(data_offset)
        
        row_size = (width * bpp + 31) // 32 * 4
        min_x, min_y, max_x, max_y = width, height, -1, -1
        bytes_per_pixel = bpp // 8
        
        for i in range(height):
            y = i if height_raw < 0 else height - 1 - i
            row_data = f.read(row_size)
            for x in range(width):
                offset = x * bytes_per_pixel
                pixel = row_data[offset:offset+bytes_per_pixel]
                if bytes_per_pixel >= 3:
                    b, g, r = pixel[0], pixel[1], pixel[2]
                    # We look for something that is NOT perfectly white and NOT black (if it's a shadow)
                    # Let's say, anything darker than (250,250,250) is part of the logo.
                    is_bg = (r > 250 and g > 250 and b > 250)
                    if bytes_per_pixel == 4:
                        a = pixel[3]
                        if a < 10:
                            is_bg = True
                    
                    if not is_bg:
                        if x < min_x: min_x = x
                        if x > max_x: max_x = x
                        if y < min_y: min_y = y
                        if y > max_y: max_y = y
                        
        print(f"{min_x},{min_y},{max_x},{max_y},{width},{height}")

if __name__ == '__main__':
    find_bbox('src/Assets/Images/Logo.bmp')
