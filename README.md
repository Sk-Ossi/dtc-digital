# DTC Digital

Kostenlose statische Download-Bibliothek auf GitHub Pages + GitHub Releases. Keine Installation oder Build-Schritte nötig. Kein Token im Browser.

## Veröffentlichung

1. In `config.js` bei `username` deinen tatsächlichen GitHub-Benutzernamen eintragen.
2. Auf https://github.com/new ein **öffentliches** Repository namens `dtc-digital` erstellen. Eine README darf angelegt werden.
3. Im Repository **Add file → Upload files** wählen. `index.html`, `style.css`, `app.js`, `config.js` und `.nojekyll` aus diesem Ordner direkt ins Hauptverzeichnis hochladen. Nicht den übergeordneten Ordner hochladen. Änderungen auf `main` speichern.
4. **Settings → Pages → Build and deployment → Deploy from a branch** wählen, Branch **main**, Ordner **/(root)** und speichern.
5. Nach erfolgreicher Bereitstellung lautet die Adresse `https://DEIN-BENUTZERNAME.github.io/dtc-digital/`. Die tatsächliche URL steht in Settings → Pages.

## Tools hinzufügen

- Für jedes Tool ein eigenes öffentliches Repository erstellen. Eigene öffentliche Repositories werden automatisch erkannt; Forks und das Bibliotheks-Repository sind ausgeschlossen.
- Unter **About** Beschreibung, Themen (Topics) und optional eine Homepage/Live-Demo hinterlegen. Die Vorschau zeigt Beschreibung und Versionshinweise; eine vorhandene Homepage wird als Live-Vorschau verlinkt.
- Unter **Releases → Create a new release** einen Tag wie `v1.0.0` anlegen und die fertigen Dateien (z. B. ZIP, PDF, EXE) anhängen. Als stabiles Release veröffentlichen. Entwürfe und Vorabversionen werden vom verwendeten `latest`-Endpunkt nicht berücksichtigt.
- Eine Datei: direkter Download auf der Karte. Mehrere Dateien: Auswahl in der Vorschau. Ohne Release bleiben Projektbeschreibung und GitHub-Link verfügbar.
- Neue Projekte und Releases werden beim nächsten Besuch nach Ablauf des 15-Minuten-Caches erkannt. `exclude` in `config.js` kann einzelne Projekte ausblenden.
- Die Suche durchsucht alle gefundenen Projekte. Pro Seite werden maximal neun Releases abgefragt. Der Dateidownloadfilter gilt für die aktuelle Seite.

## Kosten und Grenzen

- GitHub Free unterstützt Pages in öffentlichen Repositories. Website und Tool-Repositories sind für alle sichtbar. Keine Zahlungsdienste, Codespaces, Git LFS oder zusätzlichen gehosteten Dienste erforderlich.
- Unangemeldete REST-Anfragen: **60 pro Stunde pro öffentlicher IP-Adresse**, gemeinsam mit anderen GitHub-API-Nutzern derselben IP. Je 100 Repositories eine Listenanfrage, danach maximal neun Release-Anfragen pro angezeigter Seite. Lokaler Cache reduziert Wiederholungen. Bei 403/429 pausiert die Website weitere Anfragen; gespeicherte Daten bleiben soweit vorhanden sichtbar. Ohne Cache bleiben Links zu bereits geladenen Projekten verfügbar.
- Pages: maximal **1 GB veröffentlichte Website**, weiches Bandbreitenlimit **100 GB/Monat**, weiches Limit **10 Builds/Stunde**. Große Downloads als Release-Dateien hochladen, nicht in dieses Website-Repository.
- Releases: maximal **1.000 Assets pro Release**, jede Datei **kleiner als 2 GiB**. Laut GitHub kein Limit der Gesamtgröße oder Bandbreite pro Release; GitHubs Nutzungsbedingungen gelten weiterhin.
- GitHub Pages ist für Projektpräsentationen geeignet. Kein Shop, Zahlungsablauf oder kommerzielles SaaS ergänzen.
- Die Website verwendet Google Fonts mit lokalen Systemschrift-Fallbacks. Für eine Variante ohne externe Schriftanfragen die erste Zeile aus `style.css` entfernen.

Quellen (geprüft 12.10.2026):
- https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits
- https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api
- https://docs.github.com/en/repositories/releasing-projects-on-github/about-releases
- https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

## Sicherheit und Anpassung

GitHub-Tokens niemals in `config.js` oder andere öffentliche Dateien eintragen. Fremde Beschreibungen und Release-Texte werden als Text ausgegeben, nicht als HTML ausgeführt. Downloads führen zu GitHub; prüfe deine veröffentlichten Dateien selbst und gib passende Lizenzen an. Die Bibliothek verlangt keine Anmeldung. Es werden keine erfundenen Tools oder Downloadzahlen angezeigt.
