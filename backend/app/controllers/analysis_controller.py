from services.analysis_service import AnalysisService
service = AnalysisService()

class AnalysisController:

    def get_analysis(self):
        return service.get_analysis()