from app.services.analysis_service import AnalysisService
service = AnalysisService()

class AnalysisController:

    def get_analysis(self, file_path: str):
        return service.get_analysis(file_path)