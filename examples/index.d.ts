declare class ResultFormatter {
    n: any; /**\n   * Formate un pourcentage\n   */
    n: any;
    static formatPercentage(value: number, decimals?: number): string;
    n: any;
    n: any; /**\n   * Formate un nombre\n   */
    n: any;
    static formatNumber(value: number, decimals?: number): string;
    n: any;
    n: any; /**\n   * Formate une date\n   */
    n: any;
    static formatDate(date: Date): string;
    n: any;
    n: any; /**\n   * Affiche un séparateur principal\n   */
    n: any;
    static separator(title: string): void;
    n: any;
    n: any; /**\n   * Affiche un sous-titre\n   */
    n: any;
    static subsection(title: string): void;
    n: any;
    n: any; /**\n   * Affiche un résultat avec clé-valeur\n   */
    n: any;
    static result(label: string, value: string | number): void;
    n: any;
    n: any; /**\n   * Affiche une liste numérotée\n   */
    n: any;
    static list(items: string[]): void;
    n: any;
    n: any; /**\n   * Affiche un message de succès\n   */
    n: any;
    static success(message: string): void;
    n: any;
    n: any; /**\n   * Affiche un message d'erreur\n   */
    n: any;
    static error(message: string): void;
    n: any;
    n: any; /**\n   * Affiche un avertissement\n   */
    n: any;
    static warning(message: string): void;
    n: any;
}
declare class VolatilityAnalyzer {
    n: any;
    private provider;
    n: any;
    n: any;
    constructor();
    n: any;
    n: any; /**\n   * Analyse complète d'une crypto\n   */
    n: any;
    analyze(n: any, crypto: CryptoSymbol, n: any, period: TimePeriod, n: any, dvolMethod: DVOLMethod, n: any): Promise<void>;
}
//# sourceMappingURL=index.d.ts.map