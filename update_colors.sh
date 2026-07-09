#!/bin/bash

find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i \
  -e 's/bg-\[#0A0A0A\]/bg-bg-base/g' \
  -e 's/bg-\[#111111\]/bg-bg-surface/g' \
  -e 's/bg-\[#18181B\]/bg-bg-elevated/g' \
  -e 's/bg-\[#151515\]/bg-bg-surface/g' \
  -e 's/border-\[#27272A\]/border-border/g' \
  -e 's/border-white\/10/border-border/g' \
  -e 's/border-white\/5/border-border/g' \
  -e 's/text-white/text-text-primary/g' \
  -e 's/text-gray-400/text-text-muted/g' \
  -e 's/text-\[#A1A1AA\]/text-text-muted/g' \
  -e 's/text-gray-300/text-text-secondary/g' \
  -e 's/text-\[#C41E3A\]/text-brand-primary/g' \
  -e 's/text-\[#FF6B35\]/text-brand-accent/g' \
  -e 's/bg-\[#C41E3A\]/bg-brand-primary/g' \
  -e 's/bg-\[#FF6B35\]/bg-brand-accent/g' \
  -e 's/border-\[#C41E3A\]/border-brand-primary/g' \
  -e 's/border-\[#FF6B35\]/border-brand-accent/g' \
  -e 's/from-\[#C41E3A\]/from-brand-primary/g' \
  -e 's/to-\[#FF6B35\]/to-brand-accent/g' \
  -e 's/from-\[#0A0A0A\]/from-bg-base/g' \
  -e 's/to-\[#1A0A0A\]/to-bg-elevated/g' \
  -e 's/hover:text-white/hover:text-text-primary/g' \
  -e 's/hover:border-\[#C41E3A\]/hover:border-brand-primary/g' \
  {} +

