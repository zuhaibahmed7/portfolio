# Generates public/og-image.png (1200x630), apple-touch-icon.png (180x180)
# and favicon-64.png using GDI+ — matches the site design system.
Add-Type -AssemblyName System.Drawing

$out = "C:\Users\zuhai\OneDrive\Desktop\My Portfolio\public"

function New-Canvas([int]$w, [int]$h) {
  $bmp = New-Object System.Drawing.Bitmap($w, $h)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
  return @{ Bmp = $bmp; G = $g }
}

# ---------------- OG image 1200x630 ----------------
$c = New-Canvas 1200 630
$g = $c.G

# Near-black background
$bg = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 10, 10, 15))
$g.FillRectangle($bg, 0, 0, 1200, 630)

# Soft aura orbs (violet top-left, cyan bottom-right)
$gv = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(60, 124, 58, 237))
$gc = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(50, 34, 211, 238))
$g.FillEllipse($gv, -260, 60, 640, 640)
$g.FillEllipse($gc, 820, 250, 580, 580)

# Gradient monogram tile
$rect = New-Object System.Drawing.Rectangle(84, 84, 128, 128)
$lgb = New-Object System.Drawing.Drawing2D.LinearGradientBrush($rect, `
  [System.Drawing.Color]::FromArgb(255, 124, 58, 237), `
  [System.Drawing.Color]::FromArgb(255, 34, 211, 238), 45)
$g.FillRectangle($lgb, $rect)
$fontZA = New-Object System.Drawing.Font('Arial', 42, [System.Drawing.FontStyle]::Bold)
$g.DrawString('ZA', $fontZA, [System.Drawing.Brushes]::White, 110, 112)

# Name (off-white)
$fontName = New-Object System.Drawing.Font('Segoe UI', 68, [System.Drawing.FontStyle]::Bold)
$g.DrawString('Zuhaib Ahmed', $fontName, [System.Drawing.Brushes]::White, 82, 258)

# Title (muted gray)
$fontTitle = New-Object System.Drawing.Font('Segoe UI', 29)
$gray = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 161, 161, 170))
$g.DrawString('AI Engineer & Data Scientist', $fontTitle, $gray, 86, 366)

# Gradient tag words
$rect2 = New-Object System.Drawing.Rectangle(86, 436, 760, 66)
$lgb2 = New-Object System.Drawing.Drawing2D.LinearGradientBrush($rect2, `
  [System.Drawing.Color]::FromArgb(255, 124, 58, 237), `
  [System.Drawing.Color]::FromArgb(255, 34, 211, 238), 0)
$fontTag = New-Object System.Drawing.Font('Segoe UI', 32, [System.Drawing.FontStyle]::Bold)
$g.DrawString('Agentic AI · ML · Full-Stack', $fontTag, $lgb2, 86, 436)

# Footer hint
$fontSmall = New-Object System.Drawing.Font('Segoe UI', 20)
$g.DrawString('ResearchPilot · AgroVision · 7+ shipped projects', $fontSmall, $gray, 86, 540)

$c.Bmp.Save("$out\og-image.png", [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose(); $c.Bmp.Dispose()

# ---------------- apple-touch-icon 180x180 ----------------
$c = New-Canvas 180 180
$g = $c.G
$g.FillRectangle($bg, 0, 0, 180, 180)
$rectA = New-Object System.Drawing.Rectangle(0, 0, 180, 180)
$lgbA = New-Object System.Drawing.Drawing2D.LinearGradientBrush($rectA, `
  [System.Drawing.Color]::FromArgb(255, 124, 58, 237), `
  [System.Drawing.Color]::FromArgb(255, 34, 211, 238), 45)
$g.FillRectangle($lgbA, $rectA)
$fontA = New-Object System.Drawing.Font('Arial', 64, [System.Drawing.FontStyle]::Bold)
$fmt = New-Object System.Drawing.StringFormat
$fmt.Alignment = [System.Drawing.StringAlignment]::Center
$fmt.LineAlignment = [System.Drawing.StringAlignment]::Center
$g.DrawString('ZA', $fontA, [System.Drawing.Brushes]::White, (New-Object System.Drawing.RectangleF(0, 0, 180, 180)), $fmt)
$c.Bmp.Save("$out\apple-touch-icon.png", [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose(); $c.Bmp.Dispose()

# ---------------- favicon source 64x64 ----------------
$c = New-Canvas 64 64
$g = $c.G
$rectF = New-Object System.Drawing.Rectangle(0, 0, 64, 64)
$lgbF = New-Object System.Drawing.Drawing2D.LinearGradientBrush($rectF, `
  [System.Drawing.Color]::FromArgb(255, 124, 58, 237), `
  [System.Drawing.Color]::FromArgb(255, 34, 211, 238), 45)
$g.FillRectangle($lgbF, $rectF)
$fontF = New-Object System.Drawing.Font('Arial', 24, [System.Drawing.FontStyle]::Bold)
$g.DrawString('ZA', $fontF, [System.Drawing.Brushes]::White, 13, 17)
$c.Bmp.Save("$out\favicon-64.png", [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose(); $c.Bmp.Dispose()

Write-Output "done"
