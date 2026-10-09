export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24 } as const;
export const radius = { sm: 8, md: 12, lg: 16, xl: 20, pill: 999 } as const;
export const fontSize = { xs: 12, sm: 14, md: 16, lg: 18, xl: 20 } as const;

export const layout = {
    cardWidth: "90%",
    cardMaxWidth: 420,
    formMaxWidth: 320,
} as const;

const makeShadow = (y: number, opacity: number, radius: number, elevation: number) => ({
    shadowColor: "#000",
    shadowOffset: { width: 0, height: y },
    shadowOpacity: opacity,
    shadowRadius: radius,
    elevation,
});

export const shadow = {
    sm: makeShadow(2, 0.2, 4, 3),
    md: makeShadow(6, 0.12, 16, 4),
    lg: makeShadow(10, 0.15, 20, 10),
} as const;