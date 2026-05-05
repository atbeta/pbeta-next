use wasm_bindgen::prelude::*;

#[wasm_bindgen(start)]
fn start() {
    console_error_panic_hook::set_once();
}

#[wasm_bindgen]
pub fn matmul(n: usize, a: &[f64], b: &[f64]) -> Vec<f64> {
    let mut c = vec![0.0; n * n];
    for i in 0..n {
        for k in 0..n {
            let aik = a[i * n + k];
            let row_offset = i * n;
            let b_offset = k * n;
            for j in 0..n {
                c[row_offset + j] += aik * b[b_offset + j];
            }
        }
    }
    c
}

#[wasm_bindgen]
pub fn gaussian_filter(width: usize, height: usize, src: &[f64], kernel_size: usize) -> Vec<f64> {
    let half = (kernel_size / 2) as isize;
    let sigma = kernel_size as f64 / 4.0;

    let mut kernel = vec![0.0; kernel_size * kernel_size];
    let mut ksum = 0.0;
    for ky in -half..=half {
        for kx in -half..=half {
            let idx = ((ky + half) as usize) * kernel_size + (kx + half) as usize;
            let w = (-(kx * kx + ky * ky) as f64 / (2.0 * sigma * sigma)).exp();
            kernel[idx] = w;
            ksum += w;
        }
    }
    for v in kernel.iter_mut() {
        *v /= ksum;
    }

    let mut dst = vec![0.0; width * height];

    for y in half..(height as isize - half) {
        for x in half..(width as isize - half) {
            let mut sum = 0.0;
            for ky in -half..=half {
                for kx in -half..=half {
                    let px = (x + kx) as usize;
                    let py = (y + ky) as usize;
                    let ki = ((ky + half) as usize) * kernel_size + (kx + half) as usize;
                    sum += src[py * width + px] * kernel[ki];
                }
            }
            dst[(y as usize) * width + (x as usize)] = sum;
        }
    }

    dst
}

#[wasm_bindgen]
pub fn prime_sieve(limit: usize) -> Vec<u8> {
    let mut sieve = vec![1u8; limit + 1];
    sieve[0] = 0;
    if limit >= 1 {
        sieve[1] = 0;
    }
    let sqrt_limit = (limit as f64).sqrt() as usize;
    for i in 2..=sqrt_limit {
        if sieve[i] == 1 {
            let mut j = i * i;
            while j <= limit {
                sieve[j] = 0;
                j += i;
            }
        }
    }
    sieve
}

#[wasm_bindgen]
pub fn dot_product(a: &[f64], b: &[f64]) -> f64 {
    let n = a.len().min(b.len());
    let mut sum = 0.0;
    for i in 0..n {
        sum += a[i] * b[i];
    }
    sum
}

#[wasm_bindgen]
pub fn mandelbrot(width: usize, height: usize, max_iter: usize) -> Vec<u8> {
    let mut result = vec![0u8; width * height];
    for py in 0..height {
        let y0 = (py as f64 / height as f64) * 3.5 - 2.5;
        for px in 0..width {
            let x0 = (px as f64 / width as f64) * 3.5 - 2.5;
            let mut x = 0.0;
            let mut y = 0.0;
            let mut iter = 0;
            while x * x + y * y <= 4.0 && iter < max_iter {
                let xtemp = x * x - y * y + x0;
                y = 2.0 * x * y + y0;
                x = xtemp;
                iter += 1;
            }
            result[py * width + px] = if iter == max_iter { 0 } else { (iter % 255) as u8 };
        }
    }
    result
}
