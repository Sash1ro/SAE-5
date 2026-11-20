import time
import tracemalloc
from concurrent.futures import ThreadPoolExecutor

from fastapi.testclient import TestClient

from pipeline.annotate import annotate_detection


def test_benchmark_annotation_latency_and_memory_ac32_01(make_jpeg_bytes):
    hd_image = make_jpeg_bytes(width=1280, height=960)
    uhd_image = make_jpeg_bytes(width=3840, height=2160)

    annotate_detection(hd_image, 100.0, 100.0, 600.0, 800.0, "Warmup T.1", 0.9)

    latencies_ms = []
    for _ in range(25):
        t0 = time.perf_counter()
        out = annotate_detection(hd_image, 120.0, 140.0, 720.0, 860.0, "One Piece T.1", 0.94)
        latencies_ms.append((time.perf_counter() - t0) * 1000)
        assert len(out) > 0

    avg_ms = sum(latencies_ms) / len(latencies_ms)
    p95_ms = sorted(latencies_ms)[int(len(latencies_ms) * 0.95)]

    tracemalloc.start()
    t0_4k = time.perf_counter()
    out_4k = annotate_detection(uhd_image, 300.0, 200.0, 2400.0, 1900.0, "Akira T.1", 0.91)
    latency_4k_ms = (time.perf_counter() - t0_4k) * 1000
    _, peak_bytes = tracemalloc.get_traced_memory()
    tracemalloc.stop()

    peak_mb = peak_bytes / (1024 * 1024)

    print(
        f"\n[AC32.01 OpenCV] HD avg={avg_ms:.2f}ms | HD p95={p95_ms:.2f}ms | "
        f"4K latency={latency_4k_ms:.2f}ms | Python peak RAM={peak_mb:.2f}MB | "
        f"4K output={len(out_4k) / 1024:.1f}KB"
    )

    assert avg_ms < 100.0
    assert latency_4k_ms < 250.0
    assert peak_mb < 35.0


def test_concurrency_load_pipeline_and_api_ac32_01(
    client: TestClient,
    auth_headers: dict,
    make_jpeg_bytes,
):
    sample_image = make_jpeg_bytes(width=900, height=1200)

    def cpu_worker(idx: int) -> bytes:
        return annotate_detection(
            sample_image,
            80.0,
            90.0,
            810.0,
            1100.0,
            f"Manga T.{idx}",
            0.89,
        )

    t0_cpu = time.perf_counter()
    with ThreadPoolExecutor(max_workers=8) as pool:
        results = list(pool.map(cpu_worker, range(40)))
    cpu_elapsed = time.perf_counter() - t0_cpu
    cpu_throughput = len(results) / cpu_elapsed

    assert len(results) == 40
    assert all(len(item) > 0 for item in results)

    def http_worker(idx: int) -> int:
        res = client.post(
            "/api/user/history",
            data={
                "universe_name": "LoadTest Manga",
                "universe_volume": str(idx + 1),
                "ia_confidence": "0.88",
                "ia_similarity": "0.91",
                "history_result": "success",
                "history_type": "detection",
            },
            files={"image": (f"load_{idx}.jpg", sample_image, "image/jpeg")},
            headers=auth_headers,
        )
        return res.status_code

    t0_http = time.perf_counter()
    with ThreadPoolExecutor(max_workers=6) as pool:
        statuses = list(pool.map(http_worker, range(18)))
    http_elapsed = time.perf_counter() - t0_http
    http_throughput = len(statuses) / http_elapsed

    print(
        f"\n[AC32.01 Load] OpenCV 40 parallel={cpu_elapsed:.2f}s ({cpu_throughput:.1f} img/s) | "
        f"API 18 concurrent POST={http_elapsed:.2f}s ({http_throughput:.1f} req/s)"
    )

    assert all(code == 201 for code in statuses)